import type { Metadata } from "next";
import { ORG_NAME } from "@/lib/org";

/**
 * Builds the per-page metadata block.
 *
 * This exists because of a sharp edge in the Metadata API: declaring
 * `openGraph` on a page **replaces** the parent's `openGraph` object rather
 * than merging into it. Setting just `openGraph: { url }` on a page therefore
 * silently drops the inherited `siteName`, `locale`, `type` — and, on any
 * segment without its own `opengraph-image` file, the image as well. The page
 * still looks fine in a browser; the failure only shows up when someone
 * shares the link and gets a bare URL with no banner.
 *
 * So every page states its Open Graph block in full, from here.
 *
 * `images` is deliberately not set: Next fills it from the nearest
 * `opengraph-image` file convention, which is what gives each section its own
 * card while the rest fall back to the site banner.
 */
export function pageMetadata({
  path,
  title,
  description,
  /** Longer or punchier copy for the share card, when the SEO description is not it. */
  socialTitle,
  socialDescription,
}: {
  path: string;
  title: string;
  description: string;
  socialTitle?: string;
  socialDescription?: string;
}): Metadata {
  const ogTitle = socialTitle ?? `${title} | ${ORG_NAME}`;
  const ogDescription = socialDescription ?? description;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: ORG_NAME,
      locale: "en_US",
      // Facebook keys the share object on `og:url`. Without it, shares of the
      // same page with different query strings become different objects and
      // the engagement counts split.
      url: path,
      title: ogTitle,
      description: ogDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
    },
  };
}
