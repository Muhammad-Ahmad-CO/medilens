/**
 * Tiny in-memory per-IP rate limiter for API routes.
 *
 * Protects the Gemini free-tier quota (every /api/scan call costs one API
 * request) and stops fake hotspot reports from being spammed into
 * /api/reports. No dependency needed.
 *
 * NOTE (serverless): on Vercel each serverless instance keeps its own
 * counter, so this throttles per-instance rather than globally. That is
 * enough for a class demo — it turns "unlimited spam" into "slow spam"
 * and keeps honest users unaffected (limits below are generous).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Prune stale buckets occasionally so the map cannot grow forever.
let lastPrune = 0;
function prune(now: number) {
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  buckets.forEach((b, k) => {
    if (now >= b.resetAt) buckets.delete(k);
  });
}

export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Returns true when the request is allowed, false when over the limit.
 * When blocked, also returns how many seconds to wait before retrying.
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  prune(now);
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  b.count += 1;
  if (b.count > maxRequests) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Standard 429 response with a Retry-After hint. */
export function rateLimitedResponse(retryAfter: number) {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please wait a moment and try again.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  );
}
