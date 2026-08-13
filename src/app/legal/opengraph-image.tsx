import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const alt =
  "SoftwarePros legal and policy documents — privacy, terms, cookies, accessibility, and security";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Covers every page under `/legal`.
 *
 * A segment-level card is necessary, not just nice: declaring `openGraph` in a
 * page's metadata stops the *root* `opengraph-image` from being inherited, so
 * without this file the policy pages share as a bare link with no banner. The
 * nearest ancestor file wins, and this is the nearest ancestor for all five.
 */
export default function OpengraphImage() {
  return renderOgCard({
    kicker: "Legal",
    title: ["Policies &", "Disclosures"],
    description:
      "How this site handles your data, what it stores, how it is built to be accessible, and how to report a vulnerability.",
    tags: ["Privacy", "Terms", "Cookies", "Security"],
    accent: "#64748b",
    accentRgb: "100, 116, 139",
  });
}
