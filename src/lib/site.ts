/**
 * The site's canonical origin, with no trailing slash.
 *
 * `layout.tsx` builds `metadataBase` from the same env var; robots and the
 * sitemap need it as a plain string, so it lives here rather than being read
 * from `process.env` in three places with three different fallbacks.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://softwarepros.org"
).replace(/\/+$/, "");
