import { SITE_URL } from "@/lib/site";
import { SECURITY_EMAIL } from "@/lib/org";

/**
 * RFC 9116 `security.txt`.
 *
 * Served at `/.well-known/security.txt` (the canonical location per the RFC)
 * via a rewrite in `next.config.ts`, and at `/security.txt` for the legacy
 * top-level path that older scanners still check.
 *
 * `Expires` is required by the RFC and rolls forward one year from the
 * request. Generating it beats hard-coding a date: a security.txt whose
 * Expires has passed is treated as unmaintained, and a stale one is exactly
 * the sort of thing nobody notices until a researcher gives up and posts the
 * bug publicly instead.
 */
export const dynamic = "force-dynamic";

function body(): string {
  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);

  return `# SoftwarePros.org — security contact information (RFC 9116)
#
# Found something? Tell us before you tell anyone else, and we will work the
# report rather than the reporter. We do not pursue legal action against
# researchers who act in good faith under the policy below.

Contact: mailto:${SECURITY_EMAIL}
Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, "Z")}
Preferred-Languages: en
Canonical: ${SITE_URL}/.well-known/security.txt
Policy: ${SITE_URL}/legal/security

# In scope
#   ${SITE_URL} and everything served from it, including the AI Discovery
#   Center and its API routes.
#
# Out of scope
#   Denial of service, volumetric or automated scanning, social engineering
#   of staff or clients, physical attacks, and reports produced solely by an
#   automated scanner with no demonstrated impact.
#
# Please include
#   The affected URL, the steps to reproduce, and what an attacker gains.
#   If a discovery session or project summary URL is involved, send the id —
#   those URLs are capability links and we will treat yours as confidential.
`;
}

export function GET() {
  return new Response(body(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
