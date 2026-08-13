import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const alt =
  "Contact SoftwarePros — start a project or request a security assessment";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Per-page share card. A deep link shared into a chat should show what that
 * page is about, not the site's generic banner — the card is often the only
 * thing the recipient reads before deciding whether to tap.
 */
export default function OpengraphImage() {
  return renderOgCard({
    kicker: "Contact",
    title: ["Tell Us What", "You're Building"],
    description:
      "Request a security assessment, book a discovery call, or start a project with the engineering team.",
    tags: ["Projects", "Assessments", "Discovery Calls"],
  });
}
