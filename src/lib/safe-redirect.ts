/**
 * Sanitises a post-authentication `?redirect=` target down to a same-site path.
 *
 * The obvious version of this check — "starts with `/`, but not `//`" — is not
 * enough, because the browser's URL parser treats a backslash as a slash for
 * http(s) URLs before it decides where to navigate. `/\evil.example` passes
 * that check as a path and then resolves to `http://evil.example/`: an open
 * redirect on the login and signup pages, which is exactly where a phishing
 * link is most convincing, since the victim lands off-site the instant their
 * real credentials are accepted.
 *
 * So the target is resolved the same way the browser will resolve it, against
 * a base origin that exists nowhere, and anything that escapes that origin is
 * refused whatever syntax got it there — backslashes, an absolute URL, a
 * `javascript:` scheme, or the next trick of this kind.
 */
const BASE = "http://safe-redirect.invalid";

export function safeRedirect(
  value: string | undefined,
  fallback = "/discovery",
): string {
  if (!value) return fallback;

  let resolved: URL;
  try {
    resolved = new URL(value, BASE);
  } catch {
    return fallback;
  }

  if (resolved.origin !== BASE) return fallback;
  // Rebuilt from the parsed parts rather than returned as given, so what the
  // browser navigates to is what was validated.
  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}
