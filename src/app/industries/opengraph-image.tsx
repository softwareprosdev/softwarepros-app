import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const alt =
  "SoftwarePros industries — domain fluency across 15 sectors";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Per-page share card. A deep link shared into a chat should show what that
 * page is about, not the site's generic banner — the card is often the only
 * thing the recipient reads before deciding whether to tap.
 */
export default function OpengraphImage() {
  return renderOgCard({
    kicker: "Industries",
    title: ["We Speak Your", "Industry's Language"],
    description:
      "Domain fluency across 15 industries — the regulatory regimes and integration realities that decide adoption.",
    tags: ["Healthcare", "Logistics", "Finance", "Government"],
    accent: "#10b981",
    accentRgb: "16, 185, 129",
  });
}
