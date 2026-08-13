import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const alt =
  "About SoftwarePros — discovery before code, security by design";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Per-page share card. A deep link shared into a chat should show what that
 * page is about, not the site's generic banner — the card is often the only
 * thing the recipient reads before deciding whether to tap.
 */
export default function OpengraphImage() {
  return renderOgCard({
    kicker: "About",
    title: ["We Define It", "Before We Build It"],
    description:
      "Discovery before code, security as a design constraint, and engineers who own systems end to end.",
    tags: ["Discovery First", "Secure By Design", "End To End"],
  });
}
