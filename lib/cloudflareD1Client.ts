/**
 * Cloudflare D1 Database REST Client
 * Allows Next.js server routes to directly query Cloudflare D1 via official HTTPS API
 */

export interface CloudflareD1Config {
  accountId: string;
  databaseId: string;
  apiToken: string;
}

export const isCloudflareD1Configured = Boolean(
  process.env.CLOUDFLARE_ACCOUNT_ID &&
  process.env.CLOUDFLARE_DATABASE_ID &&
  process.env.CLOUDFLARE_API_TOKEN
);

export async function executeD1Query<T = unknown>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<{ success: boolean; results: T[]; error?: string }> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

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
      body: JSON.stringify({
        sql,
        params,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      const errMsg =
        data.errors && data.errors.length > 0
          ? data.errors.map((e: { message?: string }) => e.message || "").join(", ")
          : `HTTP error ${res.status}`;
      return { success: false, results: [], error: errMsg };
    }

    const firstQueryResult = data.result && data.result[0];
    const results = (firstQueryResult && firstQueryResult.results) || [];

    return { success: true, results };
  } catch (err) {
    console.error("[Cloudflare D1 Execution Error]:", err);
    return {
      success: false,
      results: [],
      error: err instanceof Error ? err.message : "Unknown Cloudflare D1 error",
    };
  }
}
