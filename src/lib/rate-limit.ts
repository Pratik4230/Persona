import { DAILY_MESSAGE_LIMIT } from "@/lib/limits";

/**
 * Server-side daily rate limiter (no database).
 *
 * State lives in a module-level `Map` on the server instance. This is the
 * authoritative check that protects OpenAI tokens: it runs BEFORE the model is
 * called, so blocked requests cost nothing.
 *
 * Trade-offs of the no-DB approach (documented on purpose):
 * - On serverless (e.g. Vercel), memory is per-instance and cleared on cold
 *   starts, so the count is best-effort, not globally consistent. It fully
 *   works on a single long-running instance (`bun run start`, a VPS, etc.).
 * - Keyed by client IP, so it survives localStorage/cookie clearing, but a
 *   determined user can still rotate IPs.
 *
 * The clean upgrade for bulletproof, cross-instance limiting is Upstash Redis
 * or Vercel KV (not a relational DB). Swap the `Map` below for a KV `INCR`
 * with a daily-expiring key and the call sites stay identical.
 */

interface Bucket {
  /** UTC day (YYYY-MM-DD) this count belongs to. */
  day: string;
  count: number;
}

const buckets = new Map<string, Bucket>();

/** Prevents unbounded memory growth from one-off IPs over long uptimes. */
const MAX_TRACKED_KEYS = 10_000;

function utcDay(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

export interface RateResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

/**
 * Consumes one unit of quota for `key`. Returns whether the request is allowed
 * and how many messages remain today. Does NOT consume when already over limit.
 */
export function consumeDailyQuota(
  key: string,
  limit = DAILY_MESSAGE_LIMIT,
): RateResult {
  const day = utcDay();
  const existing = buckets.get(key);
  const bucket: Bucket =
    existing && existing.day === day ? existing : { day, count: 0 };

  if (bucket.count >= limit) {
    buckets.set(key, bucket);
    return { allowed: false, remaining: 0, limit };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  // Opportunistic cleanup of stale entries from previous days.
  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, b] of buckets) {
      if (b.day !== day) {
        buckets.delete(k);
      }
    }
  }

  return { allowed: true, remaining: Math.max(0, limit - bucket.count), limit };
}

/** Best-effort client identifier from proxy headers (Vercel sets these). */
export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  return headers.get("x-real-ip")?.trim() || "local";
}
