import { applicantSchema } from "../../lib/validations/applicantSchema";

interface Env {
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_DATABASE_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  ADMIN_SECRET?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  DB?: any; // Native Cloudflare D1 binding if attached in Pages settings
}

function normalizePhone(phone: string): string {
  if (!phone) return "";
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

function generateReferenceId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KO-JAVA-${randomPart}`;
}

async function executeD1(
  env: Env,
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<{ success: boolean; results: any[]; error?: string }> {
  // 1. Native D1 Binding if attached
  if (env.DB && typeof env.DB.prepare === "function") {
    try {
      const stmt = env.DB.prepare(sql).bind(...params);
      const res = await stmt.all();
      return { success: true, results: res.results || [] };
    } catch (err: any) {
      return { success: false, results: [], error: err?.message || String(err) };
    }
  }

  // 2. Cloudflare D1 REST API fallback
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = env.CLOUDFLARE_DATABASE_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !databaseId || !apiToken) {
    return {
      success: false,
      results: [],
      error: "Cloudflare D1 credentials not configured.",
    };
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    });

    const data: any = await res.json();
    if (!res.ok || !data.success) {
      const errMsg =
        data.errors && data.errors.length > 0
          ? data.errors.map((e: any) => e.message || "").join(", ")
          : `HTTP error ${res.status}`;
      return { success: false, results: [], error: errMsg };
    }

    const firstResult = data.result && data.result[0];
    return { success: true, results: (firstResult && firstResult.results) || [] };
  } catch (err: any) {
    return { success: false, results: [], error: err?.message || String(err) };
  }
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key",
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestHead() {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

// POST /api/apply: Submit a new application
export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { request, env } = context;
    const body: any = await request.json();

    const parseResult = applicantSchema.safeParse(body);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      return Response.json(
        {
          success: false,
          error: "Validation failed. Please correct the highlighted errors.",
          fieldErrors,
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const validData = parseResult.data;
    const normalizedEmail = validData.email.toLowerCase().trim();
    const normalizedPhone = normalizePhone(validData.phoneNumber);

    // Duplicate Check in Cloudflare D1
    let duplicateCheckSql = "SELECT id, email, phone_number FROM applications WHERE LOWER(TRIM(email)) = ?";
    const duplicateParams: (string | number | boolean | null)[] = [normalizedEmail];

    if (normalizedPhone && normalizedPhone.length >= 6) {
      duplicateCheckSql += " OR (phone_number != '' AND phone_number LIKE ?)";
      duplicateParams.push(`%${normalizedPhone.replace(/^\+/, "")}%`);
    }
    duplicateCheckSql += " LIMIT 1";

    const existingCheck = await executeD1(env, duplicateCheckSql, duplicateParams);

    if (existingCheck.results.length > 0) {
      const match = existingCheck.results[0];
      const isEmailMatch = match.email && match.email.toLowerCase().trim() === normalizedEmail;
      return Response.json(
        {
          success: false,
          error: isEmailMatch
            ? "An application with this email address has already been submitted for this cohort."
            : "An application with this phone number has already been submitted for this cohort.",
          fieldErrors: isEmailMatch
            ? { email: "An application with this email address has already been submitted." }
            : { phoneNumber: "An application with this phone number has already been submitted." },
        },
        { status: 409, headers: CORS_HEADERS }
      );
    }

    const newId = generateReferenceId();
    const nowIso = new Date().toISOString();

    const insertRes = await executeD1(
      env,
      `INSERT INTO applications (
        id, created_at, full_name, email, phone_number,
        target_outcome, bottleneck, has_laptop, coding_level, why_you, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        newId,
        nowIso,
        validData.fullName,
        validData.email,
        validData.phoneNumber,
        validData.targetOutcome,
        validData.bottleneck,
        validData.hasLaptop,
        validData.codingLevel,
        validData.whyYou,
      ]
    );

    if (!insertRes.success) {
      if (insertRes.error && insertRes.error.toLowerCase().includes("unique")) {
        return Response.json(
          {
            success: false,
            error: "An application with this email address has already been submitted for this cohort.",
            fieldErrors: {
              email: "An application with this email address has already been submitted.",
            },
          },
          { status: 409, headers: CORS_HEADERS }
        );
      }
      throw new Error(insertRes.error || "Failed to persist application into Cloudflare D1.");
    }

    return Response.json(
      {
        success: true,
        message: "Your application has been successfully submitted! Check your email for next steps.",
        applicantId: newId,
        applicant: {
          id: newId,
          createdAt: nowIso,
          status: "pending",
          ...validData,
        },
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[Cloudflare Pages POST /api/apply Error]:", error);
    return Response.json(
      {
        success: false,
        error: "An unexpected error occurred while processing your application. Please try again.",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// GET /api/apply: List applications (Admin)
export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    const adminKey = request.headers.get("x-admin-key") || url.searchParams.get("key");
    const configuredSecret = env.ADMIN_SECRET;

    const isAuthorized =
      configuredSecret &&
      ((authHeader && authHeader === `Bearer ${configuredSecret}`) ||
        (adminKey && adminKey === configuredSecret));

    if (!isAuthorized) {
      return Response.json(
        { success: false, error: "Unauthorized access to admin API." },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const d1Res = await executeD1(
      env,
      "SELECT * FROM applications ORDER BY created_at DESC LIMIT 500"
    );

    const mapped = (d1Res.results || []).map((row: any) => ({
      id: String(row.id),
      createdAt: String(row.created_at || ""),
      status: String(row.status || "pending"),
      fullName: String(row.full_name || ""),
      email: String(row.email || ""),
      phoneNumber: String(row.phone_number || ""),
      targetOutcome: String(row.target_outcome || ""),
      bottleneck: String(row.bottleneck || ""),
      hasLaptop: String(row.has_laptop || "yes"),
      codingLevel: String(row.coding_level || "1"),
      whyYou: String(row.why_you || ""),
      notes: String(row.notes || ""),
    }));

    return Response.json(
      {
        success: true,
        applications: mapped,
        source: "cloudflare-d1",
        count: mapped.length,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[Cloudflare Pages GET /api/apply Error]:", error);
    return Response.json(
      { success: false, error: "Failed to retrieve applications." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// PATCH /api/apply: Update applicant status (Admin)
export async function onRequestPatch(context: { request: Request; env: Env }) {
  try {
    const { request, env } = context;
    const body: any = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return Response.json(
        { success: false, error: "Missing required 'id' or 'status' fields." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const updateRes = await executeD1(
      env,
      "UPDATE applications SET status = ? WHERE id = ?",
      [status, id]
    );

    if (!updateRes.success) {
      throw new Error(updateRes.error || "Failed to update record in Cloudflare D1.");
    }

    return Response.json(
      { success: true, id, status, updated: true },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[Cloudflare Pages PATCH /api/apply Error]:", error);
    return Response.json(
      { success: false, error: "Failed to update application status." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
