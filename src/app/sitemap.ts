import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { PUBLIC_ROUTES } from "@/lib/routes";

/**
 * Driven by the shared route table so a page cannot exist in the footer and
 * be missing here. Session and summary URLs are capability links and are
 * deliberately excluded — see the note in `robots.ts`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // One timestamp for the whole build: these pages ship together, so claiming
  // per-page modification dates we do not actually track would be fiction.
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    // No trailing slash on the root entry: Next resolves the homepage's
    // `canonical: "/"` to a bare origin, and a sitemap URL that disagrees
    // with the page's own canonical is a self-inflicted duplicate signal.
    url: route.path === "/" ? SITE_URL : `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
