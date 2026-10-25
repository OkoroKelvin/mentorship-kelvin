import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  isFallback: boolean;
}

// In-memory sliding window fallback store (10 minute window)
const inMemoryStore = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 15; // 15 requests per 10 mins per IP (accommodates shared campus/co-working Wi-Fi)

function fallbackRateLimiter(ip: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (inMemoryStore.get(ip) || []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS) {
    const oldest = timestamps[0];
    const resetMs = oldest + WINDOW_MS - now;
    return {
      allowed: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      resetMs,
      isFallback: true,
    };
  }

  timestamps.push(now);
  inMemoryStore.set(ip, timestamps);
  return {
    allowed: true,
    limit: MAX_REQUESTS,
    remaining: MAX_REQUESTS - timestamps.length,
    resetMs: WINDOW_MS,
    isFallback: true,
  };
}

let upstashRatelimitInstance: Ratelimit | null = null;

function getUpstashLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!upstashRatelimitInstance) {
    try {
      const redis = new Redis({
        url,
        token,
      });

      upstashRatelimitInstance = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(15, "10 m"), // 15 requests per 10 mins
        analytics: true,
        prefix: "mentorship:ratelimit",
      });
    } catch (err) {
      console.warn("[RateLimit] Failed to instantiate Upstash Redis client:", err);
      return null;
    }
  }

  return upstashRatelimitInstance;
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  // Never rate limit local development or localhost
  if (
    process.env.NODE_ENV === "development" ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "localhost"
  ) {
    return {
      allowed: true,
      limit: 10000,
      remaining: 10000,
      resetMs: 0,
      isFallback: true,
    };
  }

  const limiter = getUpstashLimiter();

  if (!limiter) {
    // Graceful fallback to in-memory sliding window
    return fallbackRateLimiter(ip);
  }

  try {
    const result = await limiter.limit(ip);
    return {
      allowed: result.success,
      limit: result.limit,
      remaining: result.remaining,
      resetMs: result.reset - Date.now(),
      isFallback: false,
    };
  } catch (err) {
    console.error("[RateLimit] Upstash execution error, falling back:", err);
    return fallbackRateLimiter(ip);
  }
}
