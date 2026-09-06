import "server-only";

type Bucket = { count: number; resetAt: number };

/**
 * In-memory fixed-window rate limiter.
 *
 * Deliberately simple: it protects a single instance against casual abuse and
 * runaway model spend. It does NOT survive restarts and does NOT coordinate
 * across instances — put a shared store (Redis, Upstash) behind this interface
 * before running more than one replica.
 */
const buckets = new Map<string, Bucket>();

// Bound the map so a flood of unique keys can't grow it without limit.
const MAX_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_KEYS) sweep(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return {
    ok: true,
    remaining: limit - bucket.count,
    retryAfterSeconds: 0,
  };
}

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  // Still full of live entries — drop the oldest to stay bounded.
  if (buckets.size >= MAX_KEYS) {
    const excess = buckets.size - Math.floor(MAX_KEYS * 0.9);
    let dropped = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (++dropped >= excess) break;
    }
  }
}

/**
 * Client identity for rate limiting, best available first.
 *
 * `cf-connecting-ip` leads because Cloudflare sets it from the connection it
 * terminated and overwrites any value the client sent, so behind Cloudflare it
 * is the one hop an attacker cannot forge. `x-forwarded-for` is the opposite:
 * a client can send it and append to it freely, so keying on it alone meant a
 * flood could rotate the header and get a fresh bucket per request — the limit
 * counted attackers rather than stopping them.
 *
 * Still not an access control. Off Cloudflare, or behind a proxy that does not
 * overwrite these, this remains a speed bump against casual abuse and runaway
 * model spend — never make an authorisation decision from it.
 */
export function clientKey(request: Request, scope: string) {
  const headers = request.headers;
  const ip =
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  return `${scope}:${ip}`;
}

export function tooManyRequests(result: RateLimitResult, message: string) {
  return Response.json(
    { error: message },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    },
  );
}
