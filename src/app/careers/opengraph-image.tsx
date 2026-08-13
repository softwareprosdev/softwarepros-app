import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const alt =
  "Careers at SoftwarePros — own the system, not the ticket";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Per-page share card. A deep link shared into a chat should show what that
 * page is about, not the site's generic banner — the card is often the only
 * thing the recipient reads before deciding whether to tap.
 */
export default function OpengraphImage() {
  return renderOgCard({
    kicker: "Careers",
    title: ["Own The System,", "Not The Ticket"],
    description:
      "What the engineering bar is, what the work involves, and how to reach us with what you have built.",
    tags: ["Engineering", "Ownership", "Breadth"],
    accent: "#a855f7",
    accentRgb: "168, 85, 247",
  });
}
