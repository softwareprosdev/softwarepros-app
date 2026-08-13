import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const alt =
  "SoftwarePros solutions — 20 engineering disciplines across AI, software, security, and cloud";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Per-page share card. A deep link shared into a chat should show what that
 * page is about, not the site's generic banner — the card is often the only
 * thing the recipient reads before deciding whether to tap.
 */
export default function OpengraphImage() {
  return renderOgCard({
    kicker: "Solutions",
    title: ["Engineering", "Solutions"],
    description:
      "20 engineering disciplines spanning AI, software engineering, security, cloud, and business systems.",
    tags: ["AI", "Engineering", "Security", "Business Systems"],
  });
}
