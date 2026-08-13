import { createHash, timingSafeEqual } from "node:crypto";

const REALM = 'Basic realm="SoftwarePros Admin", charset="UTF-8"';

/**
 * Hash before comparing so both buffers are always 32 bytes:
 * `timingSafeEqual` throws on a length mismatch, and comparing raw values
 * would leak the length of the configured secret through that throw.
 */
function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

/**
 * HTTP Basic auth for the admin area, checked against `ADMIN_USER` /
 * `ADMIN_PASSWORD`.
 *
 * Fails closed on purpose: `/admin/*` exposes captured lead PII (names,
 * emails, phone numbers, free-text project details), so a deployment that
 * forgot to configure `ADMIN_PASSWORD` must be locked rather than open. There
 * is deliberately no default credential to fall back to.
 */
export function isAuthorized(request: Request): boolean {
  const expectedUser = process.env.ADMIN_USER || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) return false;

  const header = request.headers.get("authorization");
  if (!header) return false;

  const separator = header.indexOf(" ");
  if (separator === -1) return false;
  const scheme = header.slice(0, separator);
  const encoded = header.slice(separator + 1).trim();
  if (scheme.toLowerCase() !== "basic" || !encoded) return false;

  let decoded: string;
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return false;
  }

  const colon = decoded.indexOf(":");
  if (colon === -1) return false;

  // Both halves are always compared — no short-circuit that would reveal
  // which of the two was wrong. Credentials are never logged.
  const userOk = safeEqual(decoded.slice(0, colon), expectedUser);
  const passwordOk = safeEqual(decoded.slice(colon + 1), expectedPassword);
  return userOk && passwordOk;
}

/** 401 challenge shared by the proxy and the admin route handlers. */
export function unauthorizedResponse(): Response {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": REALM,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
