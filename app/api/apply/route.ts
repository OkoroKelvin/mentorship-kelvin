import { NextRequest, NextResponse } from "next/server";
import { applicantSchema, ApplicantRecord } from "@/lib/validations/applicantSchema";
import { checkRateLimit } from "@/lib/upstashRateLimiter";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { isCloudflareD1Configured, executeD1Query } from "@/lib/cloudflareD1Client";
import { generateReferenceId } from "@/lib/applicantStore";

function normalizePhone(phone: string): string {
  if (!phone) return "";
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

function phonesMatch(phoneA: string, phoneB: string): boolean {
  if (!phoneA || !phoneB) return false;
  const normA = normalizePhone(phoneA);
  const normB = normalizePhone(phoneB);
  if (normA && normB && normA === normB) return true;

  const digitsA = phoneA.replace(/\D/g, "");
  const digitsB = phoneB.replace(/\D/g, "");
  if (!digitsA || !digitsB || digitsA.length < 7 || digitsB.length < 7) return false;
  if (digitsA === digitsB) return true;

  if (digitsA.length >= 8 && digitsB.length >= 8) {
    const strippedA = digitsA.replace(/^0+/, "");
    const strippedB = digitsB.replace(/^0+/, "");
    if (strippedA === strippedB) return true;
    if (strippedA.endsWith(strippedB) || strippedB.endsWith(strippedA)) return true;
  }
  return false;
}

// In-memory fallback applicants store for local dev or when Supabase is offline
const inMemoryApplicants: ApplicantRecord[] = [
  {
    id: "app_demo_1",
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phoneNumber: "+1 415 555 0192",
    profileUrl: "https://github.com/arivera-dev",
    yearsOfExperience: "3-5 years",
    currentRole: "Mid-level Fullstack Engineer",
    primaryStack: "TypeScript, React, Node.js, PostgreSQL",
    targetOutcome: "Level up to Senior Engineer and master distributed system architectures",
    bottleneck: "Lacking confidence in high-scale system design and large codebase refactoring",
    weeklyHours: "10-15 hrs/week",
    whyYou: "I have shipped multiple MVPs but hit a plateau at my current company. I want Kelvin's direct eyes on my PRs and system designs to break into a Tier-1 tech company.",
    status: "shortlisted",
    createdAt: "2026-10-23T10:00:00.000Z",
  },
  {
    id: "app_demo_2",
    fullName: "Chioma Nwosu",
    email: "chioma.n@example.com",
    phoneNumber: "+44 7700 900123",
    profileUrl: "https://linkedin.com/in/chioma-nwosu",
    yearsOfExperience: "5+ years",
    currentRole: "Backend Engineer",
    primaryStack: "Go, Kubernetes, Kafka, gRPC, AWS",
    targetOutcome: "Launch a production high-throughput microservices SaaS within 30 days",
    bottleneck: "Analysis paralysis on infrastructure patterns and developer velocity",
    weeklyHours: "15+ hrs/week",
    whyYou: "I am ready to commit 20+ hours a week. I need someone who has operated at high scale to audit my architecture before we launch to 50k beta users.",
    status: "pending",
    createdAt: "2026-10-24T12:00:00.000Z",
  },
  {
    id: "app_demo_3",
    fullName: "Marcus Chen",
    email: "m.chen@example.org",
    phoneNumber: "+1 212 555 0148",
    profileUrl: "https://github.com/marcuschen-oss",
    yearsOfExperience: "1-3 years",
    currentRole: "Frontend Developer",
    primaryStack: "Next.js, Tailwind CSS, TypeScript, GraphQL",
    targetOutcome: "Transition to Fullstack Engineering and ace Technical Lead screens",
    bottleneck: "Backend database indexing, query optimization, and architectural trade-offs",
    weeklyHours: "10-15 hrs/week",
    whyYou: "I have been following Kelvin's engineering breakdowns. His pragmatic, no-BS approach to shipping software matches exactly the mentor guidance I need.",
    status: "selected",
    createdAt: "2026-10-23T08:00:00.000Z",
  },
  {
    id: "app_demo_4",
    fullName: "Devon Bailey",
    email: "devon.b@example.net",
    phoneNumber: "+234 803 555 0177",
    profileUrl: "https://github.com/dbailey-codes",
    yearsOfExperience: "<1 year",
    currentRole: "Junior Developer",
    primaryStack: "Python, Django, PostgreSQL",
    targetOutcome: "Learn production git workflows and CI/CD pipelines",
    bottleneck: "Troubleshooting complex staging environments and containerization",
    weeklyHours: "5-10 hrs/week",
    whyYou: "I'm looking for guidance on how senior engineers think through code reviews and system reliability.",
    status: "rejected",
    createdAt: "2026-10-22T16:00:00.000Z",
  },
];

export async function POST(req: NextRequest) {
  try {
    // 1. IP extraction & Upstash Redis Rate Limiting Check (5 req / 10 mins)
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    const rateLimit = await checkRateLimit(ip);

    if (!rateLimit.allowed) {
      const retrySeconds = Math.max(1, Math.ceil(rateLimit.resetMs / 1000));
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. You can submit up to 5 applications per 10 minutes.",
          retryAfterSeconds: retrySeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retrySeconds.toString(),
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 2. Strict Zod Schema Validation
    const body = await req.json();
    const parseResult = applicantSchema.safeParse(body);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });

      return NextResponse.json(
        {
          success: false,
          error: "Validation failed. Please correct the highlighted errors.",
          fieldErrors,
        },
        { status: 400 }
      );
    }

    const validData = parseResult.data;
    const normalizedEmail = validData.email.toLowerCase().trim();
    const normalizedPhone = normalizePhone(validData.phoneNumber);

    // 3. Duplicate Email Check (Prevent multiple applications with the same email)
    const inMemoryEmailDuplicate = inMemoryApplicants.some(
      (app) => app.email.toLowerCase().trim() === normalizedEmail
    );

    if (inMemoryEmailDuplicate) {
      return NextResponse.json(
        {
          success: false,
          error: "An application with this email address has already been submitted for this cohort.",
          fieldErrors: {
            email: "An application with this email address has already been submitted.",
          },
        },
        { status: 409 }
      );
    }

    // 4. Duplicate Phone Number Check (Prevent multiple applications with the same phone number)
    const phoneDigits = validData.phoneNumber.replace(/\D/g, "");
    if (phoneDigits && phoneDigits.length >= 6) {
      const inMemoryPhoneDuplicate = inMemoryApplicants.some(
        (app) => app.phoneNumber && phonesMatch(app.phoneNumber, validData.phoneNumber)
      );

      if (inMemoryPhoneDuplicate) {
        return NextResponse.json(
          {
            success: false,
            error: "An application with this phone number has already been submitted for this cohort.",
            fieldErrors: {
              phoneNumber: "An application with this phone number has already been submitted.",
            },
          },
          { status: 409 }
        );
      }
    }

    // 5. Cloudflare D1 or Supabase Database Persistence
    let createdApplicant: ApplicantRecord;

    if (isCloudflareD1Configured) {
      try {
        // Check for duplicate email in Cloudflare D1
        const emailCheck = await executeD1Query<{ id: string }>(
          "SELECT id FROM applications WHERE LOWER(TRIM(email)) = ? LIMIT 1",
          [normalizedEmail]
        );

        if (emailCheck.results.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: "An application with this email address has already been submitted for this cohort.",
              fieldErrors: {
                email: "An application with this email address has already been submitted.",
              },
            },
            { status: 409 }
          );
        }

        // Check for duplicate phone in Cloudflare D1
        if (normalizedPhone && normalizedPhone.length >= 6) {
          const phoneLookup = `%${normalizedPhone.replace(/^\+/, "")}%`;
          const phoneCheck = await executeD1Query<{ id: string }>(
            "SELECT id FROM applications WHERE phone_number LIKE ? LIMIT 1",
            [phoneLookup]
          );

          if (phoneCheck.results.length > 0) {
            return NextResponse.json(
              {
                success: false,
                error: "An application with this phone number has already been submitted for this cohort.",
                fieldErrors: {
                  phoneNumber: "An application with this phone number has already been submitted.",
                },
              },
              { status: 409 }
            );
          }
        }

        const newId = generateReferenceId();
        const nowIso = new Date().toISOString();

        const insertRes = await executeD1Query(
          `INSERT INTO applications (
            id, created_at, full_name, email, phone_number, profile_url,
            years_of_experience, current_role, primary_stack, target_outcome,
            bottleneck, weekly_hours, why_you, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', '')`,
          [
            newId,
            nowIso,
            validData.fullName,
            validData.email,
            validData.phoneNumber,
            validData.profileUrl || "",
            validData.yearsOfExperience || "",
            validData.currentRole || "",
            validData.primaryStack,
            validData.targetOutcome,
            validData.bottleneck,
            validData.weeklyHours,
            validData.whyYou,
          ]
        );

        if (!insertRes.success) {
          throw new Error(insertRes.error || "Failed to insert into Cloudflare D1");
        }

        createdApplicant = {
          id: newId,
          createdAt: nowIso,
          status: "pending",
          ...validData,
        };
      } catch (d1Err) {
        console.warn("[Cloudflare D1 Fallback] Error writing to D1, using in-memory:", d1Err);
        createdApplicant = {
          id: generateReferenceId(),
          createdAt: new Date().toISOString(),
          status: "pending",
          ...validData,
        };
        inMemoryApplicants.unshift(createdApplicant);
      }
    } else if (isSupabaseConfigured && getSupabaseServerClient()) {
      const supabase = getSupabaseServerClient()!;
      try {
        // Check for duplicate email in Supabase
        const { data: existingAppEmail } = await supabase
          .from("applications")
          .select("id")
          .ilike("email", normalizedEmail)
          .maybeSingle();

        if (existingAppEmail) {
          return NextResponse.json(
            {
              success: false,
              error: "An application with this email address has already been submitted for this cohort.",
              fieldErrors: {
                email: "An application with this email address has already been submitted.",
              },
            },
            { status: 409 }
          );
        }

        // Check for duplicate phone in Supabase
        if (normalizedPhone && normalizedPhone.length >= 6) {
          const { data: existingAppPhone } = await supabase
            .from("applications")
            .select("id")
            .ilike("phone_number", `%${normalizedPhone.replace(/^\+/, "")}%`)
            .maybeSingle();

          if (existingAppPhone) {
            return NextResponse.json(
              {
                success: false,
                error: "An application with this phone number has already been submitted for this cohort.",
                fieldErrors: {
                  phoneNumber: "An application with this phone number has already been submitted.",
                },
              },
              { status: 409 }
            );
          }
        }

        const { data, error } = await supabase
          .from("applications")
          .insert([
            {
              full_name: validData.fullName,
              email: validData.email,
              phone_number: validData.phoneNumber,
              profile_url: validData.profileUrl,
              years_of_experience: validData.yearsOfExperience,
              current_role: validData.currentRole,
              primary_stack: validData.primaryStack,
              target_outcome: validData.targetOutcome,
              bottleneck: validData.bottleneck,
              weekly_hours: validData.weeklyHours,
              why_you: validData.whyYou,
              status: "pending",
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("[Supabase Insert Error]:", error);
          if ((error as { code?: string }).code === "23505") {
            return NextResponse.json(
              {
                success: false,
                error: "An application with this email or phone number has already been submitted for this cohort.",
                fieldErrors: {
                  email: "An application with this email has already been submitted.",
                },
              },
              { status: 409 }
            );
          }
          // Fall through to fallback store so submission is never lost
          throw error;
        }

        createdApplicant = {
          id: data.id,
          createdAt: data.created_at,
          status: data.status,
          fullName: data.full_name,
          email: data.email,
          phoneNumber: data.phone_number || validData.phoneNumber,
          profileUrl: data.profile_url,
          yearsOfExperience: data.years_of_experience,
          currentRole: data.current_role,
          primaryStack: data.primary_stack,
          targetOutcome: data.target_outcome,
          bottleneck: data.bottleneck,
          weeklyHours: data.weekly_hours,
          whyYou: data.why_you,
          notes: data.notes || "",
        };
      } catch (dbErr) {
        console.warn("[Supabase Fallback] Saving to in-memory store due to DB error:", dbErr);
        createdApplicant = {
          id: generateReferenceId(),
          createdAt: new Date().toISOString(),
          status: "pending",
          ...validData,
        };
        inMemoryApplicants.unshift(createdApplicant);
      }
    } else {
      // In-memory fallback
      createdApplicant = {
        id: generateReferenceId(),
        createdAt: new Date().toISOString(),
        status: "pending",
        ...validData,
      };
      inMemoryApplicants.unshift(createdApplicant);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully! Kelvin will review your submission within 24 hours.",
        applicant: createdApplicant,
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error("[Ingestion API Fatal Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while processing application. Please try again.",
      },
      { status: 500 }
    );
  }
}

function convertApplicantsToCSV(applicants: ApplicantRecord[]): string {
  const headers = [
    "Applicant ID",
    "Submission Date",
    "Full Name",
    "Email",
    "Phone (WhatsApp)",
    "Profile URL",
    "Years of Experience",
    "Current Role",
    "Primary Stack",
    "30-Day Target Outcome",
    "Biggest Bottleneck",
    "Weekly Hours Commitment",
    "Why You Pitch",
    "Review Status",
  ];

  const escapeCSV = (str: string | undefined) => {
    if (!str) return '""';
    const clean = str.replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, " ");
    return `"${clean}"`;
  };

  const rows = applicants.map((app) => [
    escapeCSV(app.id),
    escapeCSV(new Date(app.createdAt).toLocaleString()),
    escapeCSV(app.fullName),
    escapeCSV(app.email),
    escapeCSV(app.phoneNumber),
    escapeCSV(app.profileUrl),
    escapeCSV(app.yearsOfExperience),
    escapeCSV(app.currentRole),
    escapeCSV(app.primaryStack),
    escapeCSV(app.targetOutcome),
    escapeCSV(app.bottleneck),
    escapeCSV(app.weeklyHours),
    escapeCSV(app.whyYou),
    escapeCSV(app.status.toUpperCase()),
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
}

export async function GET(req: NextRequest) {
  const isCSV = req.nextUrl?.searchParams?.get("format") === "csv";

  if (isCloudflareD1Configured) {
    try {
      const res = await executeD1Query<Record<string, unknown>>(
        "SELECT * FROM applications ORDER BY created_at DESC"
      );
      if (res.success && Array.isArray(res.results)) {
        const formatted: ApplicantRecord[] = res.results.map((row) => ({
          id: String(row.id),
          createdAt: String(row.created_at),
          status: (row.status as ApplicantRecord["status"]) || "pending",
          fullName: String(row.full_name || ""),
          email: String(row.email || ""),
          phoneNumber: String(row.phone_number || ""),
          profileUrl: String(row.profile_url || ""),
          yearsOfExperience: String(row.years_of_experience || ""),
          currentRole: String(row.current_role || ""),
          primaryStack: String(row.primary_stack || "Java"),
          targetOutcome: String(row.target_outcome || ""),
          bottleneck: String(row.bottleneck || ""),
          weeklyHours: String(row.weekly_hours || ""),
          whyYou: String(row.why_you || ""),
          notes: String(row.notes || ""),
        }));

        if (isCSV) {
          const csvText = convertApplicantsToCSV(formatted);
          return new NextResponse(csvText, {
            status: 200,
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": `attachment; filename="kelvin-mentorship-applicants-${new Date().toISOString().slice(0, 10)}.csv"`,
            },
          });
        }

        return NextResponse.json({
          success: true,
          source: "cloudflare-d1",
          count: formatted.length,
          applicants: formatted,
        });
      }
    } catch (d1Err) {
      console.warn("[GET /api/apply] Cloudflare D1 fetch error, using fallback:", d1Err);
    }
  }

  const supabase = getSupabaseServerClient();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted: ApplicantRecord[] = data.map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        status: row.status,
        fullName: row.full_name,
        email: row.email,
        phoneNumber: row.phone_number || "",
        profileUrl: row.profile_url,
        yearsOfExperience: row.years_of_experience,
        currentRole: row.current_role,
        primaryStack: row.primary_stack,
        targetOutcome: row.target_outcome,
        bottleneck: row.bottleneck,
        weeklyHours: row.weekly_hours,
        whyYou: row.why_you,
        notes: row.notes || "",
      }));

      return NextResponse.json({
        success: true,
        source: "supabase",
        count: formatted.length,
        applicants: formatted,
      });
    } catch (dbErr) {
      console.warn("[GET /api/apply] Supabase fetch error, using fallback:", dbErr);
    }
  }

  return NextResponse.json({
    success: true,
    source: "in-memory",
    count: inMemoryApplicants.length,
    applicants: inMemoryApplicants,
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    if (!id || !["pending", "shortlisted", "selected", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID or status" },
        { status: 400 }
      );
    }

    if (isCloudflareD1Configured) {
      try {
        const updateRes = await executeD1Query(
          "UPDATE applications SET status = ? WHERE id = ?",
          [status, id]
        );

        if (updateRes.success) {
          const fetchRes = await executeD1Query<Record<string, unknown>>(
            "SELECT * FROM applications WHERE id = ? LIMIT 1",
            [id]
          );

          if (fetchRes.success && fetchRes.results.length > 0) {
            const row = fetchRes.results[0];
            return NextResponse.json({
              success: true,
              applicant: {
                id: String(row.id),
                createdAt: String(row.created_at),
                status: (row.status as ApplicantRecord["status"]) || status,
                fullName: String(row.full_name || ""),
                email: String(row.email || ""),
                phoneNumber: String(row.phone_number || ""),
                profileUrl: String(row.profile_url || ""),
                yearsOfExperience: String(row.years_of_experience || ""),
                currentRole: String(row.current_role || ""),
                primaryStack: String(row.primary_stack || "Java"),
                targetOutcome: String(row.target_outcome || ""),
                bottleneck: String(row.bottleneck || ""),
                weeklyHours: String(row.weekly_hours || ""),
                whyYou: String(row.why_you || ""),
                notes: String(row.notes || ""),
              },
            });
          }
        }
      } catch (d1Err) {
        console.warn("[PATCH /api/apply] Cloudflare D1 update error:", d1Err);
      }
    }

    const supabase = getSupabaseServerClient();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("applications")
          .update({ status })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          applicant: {
            id: data.id,
            createdAt: data.created_at,
            status: data.status,
            fullName: data.full_name,
            email: data.email,
            phoneNumber: data.phone_number || "",
            profileUrl: data.profile_url,
            yearsOfExperience: data.years_of_experience,
            currentRole: data.current_role,
            primaryStack: data.primary_stack,
            targetOutcome: data.target_outcome,
            bottleneck: data.bottleneck,
            weeklyHours: data.weekly_hours,
            whyYou: data.why_you,
            notes: data.notes || "",
          },
        });
      } catch (err) {
        console.warn("[PATCH /api/apply] Supabase update failed, updating in-memory:", err);
      }
    }

    // In-memory fallback
    const target = inMemoryApplicants.find((a) => a.id === id);
    if (target) {
      target.status = status;
      return NextResponse.json({ success: true, applicant: target });
    }

    return NextResponse.json({ success: true, id, status });
  } catch (error) {
    console.error("[PATCH /api/apply Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update applicant status" },
      { status: 500 }
    );
  }
}

