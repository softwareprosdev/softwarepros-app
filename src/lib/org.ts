import { SITE_URL } from "@/lib/site";

/**
 * The single description of who SoftwarePros is. The footer, the JSON-LD
 * entity graph, `/llms.txt` and `/ai.txt` all read from here, so the identity
 * a search engine resolves and the identity a visitor sees cannot drift.
 *
 * Only put verifiable facts in this file. Anything here ends up in structured
 * data, where an invented claim is not a typo — it is a policy violation.
 */

export const ORG_NAME = "SoftwarePros";
export const ORG_LEGAL_NAME = "SoftwarePros.org";
export const ORG_EMAIL = "info@softwarepros.org";

/**
 * Name, address, phone — the "NAP" triple local search ranks on.
 *
 * These three must appear on the site *identically* to how they appear in the
 * `LocalBusiness` structured data and in any external directory listing
 * (Google Business Profile, Apple Business Connect, Bing Places). Local search
 * treats a mismatched suite number or a spelled-out "Street" as a different
 * business, which splits the entity instead of strengthening it. So the page
 * and the schema both render from this one object.
 */
export const ORG_ADDRESS = {
  street: "222 E. Van Buren St.",
  locality: "Harlingen",
  /** Two-letter code — schema.org `addressRegion` expects the abbreviation. */
  region: "TX",
  postalCode: "78550-9106",
  /** ISO 3166-1 alpha-2, per schema.org `addressCountry`. */
  country: "US",
} as const;

/** How the address reads in prose and on the contact page. */
export const ORG_ADDRESS_LINES = [
  ORG_ADDRESS.street,
  `${ORG_ADDRESS.locality}, ${ORG_ADDRESS.region} ${ORG_ADDRESS.postalCode}`,
] as const;

/** Display form, matching how the number is written on the site. */
export const ORG_PHONE_DISPLAY = "956.392.1440";

/**
 * E.164. Structured data and `tel:` links both want the unpunctuated
 * international form; only humans get the dotted version above.
 */
export const ORG_PHONE_E164 = "+19563921440";

/**
 * Where security researchers report vulnerabilities. Published in
 * `/.well-known/security.txt` and on `/legal/security`, so it must be a
 * monitored inbox — an unread address here is worse than none, because it
 * tells a researcher they were heard when they were not.
 */
export const SECURITY_EMAIL = "info@softwarepros.org";

export const ORG_DESCRIPTION =
  "SoftwarePros is a software engineering firm that builds AI systems, custom software, cybersecurity programs, and cloud infrastructure for organizations replacing manual complexity with automation, security, and scale.";

export const ORG_SHORT_DESCRIPTION =
  "AI-first software engineering, cybersecurity, and cloud infrastructure.";

/** The four practice areas, in the order the site presents them. */
export const ORG_DISCIPLINES = [
  "Artificial Intelligence",
  "Software Engineering",
  "Cybersecurity",
  "Cloud Infrastructure",
] as const;

/**
 * Verified public profiles, emitted as `sameAs` on the Organization node.
 *
 * `sameAs` is how a search engine decides two identities are the same entity,
 * so a wrong URL actively merges this company with someone else's. The design
 * comps shipped bare `linkedin.com` / `x.com` / `github.com` placeholders —
 * those are not profiles and are deliberately absent. Add real profile URLs
 * here and both the footer icons and the knowledge graph pick them up.
 */
export const ORG_PROFILES: Array<{
  icon: string;
  label: string;
  href: string;
}> = [];

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
