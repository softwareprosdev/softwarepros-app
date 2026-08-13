import type { MetadataRoute } from "next";
import { ORG_NAME, ORG_SHORT_DESCRIPTION } from "@/lib/org";

/**
 * Web app manifest. The site is not an installable app, but a manifest is
 * what tells Android which colours to paint the browser chrome — without it
 * the address bar renders light against a page that is dark-only.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${ORG_NAME} — AI, Software Engineering, Cybersecurity, Cloud`,
    short_name: ORG_NAME,
    description: ORG_SHORT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#050508",
    theme_color: "#050508",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
