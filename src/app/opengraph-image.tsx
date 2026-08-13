import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const alt =
  "SoftwarePros — AI, software engineering, cybersecurity, and cloud infrastructure";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Site-wide share card. Design and platform constraints live in `og-card`. */
export default function OpengraphImage() {
  return renderOgCard({
    kicker: "Software Engineering",
    title: ["Build Software", "That Doesn't Break"],
    description:
      "Intelligent systems for organizations replacing complexity with automation, security, and scale.",
    tags: ["AI", "Software Engineering", "Cybersecurity", "Cloud"],
  });
}
