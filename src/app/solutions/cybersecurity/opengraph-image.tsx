import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const alt =
  "SoftwarePros cybersecurity — offensive security, defensive architecture, and security operations";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Per-page share card. A deep link shared into a chat should show what that
 * page is about, not the site's generic banner — the card is often the only
 * thing the recipient reads before deciding whether to tap.
 */
export default function OpengraphImage() {
  return renderOgCard({
    kicker: "Cybersecurity",
    title: ["Security Isn't A Feature.", "It's The Foundation."],
    description:
      "Offensive capabilities, defensive architecture, and 24/7 security operations — engineered in, not audited on.",
    tags: ["Pen Testing", "Compliance", "Threat Detection", "Response"],
    accent: "#ef4444",
    accentRgb: "239, 68, 68",
  });
}
