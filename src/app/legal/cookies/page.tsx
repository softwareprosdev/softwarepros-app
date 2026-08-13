import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { COOKIE_NOTICE_KEY, OWNER_COOKIE_NAME } from "@/lib/cookie-names";
import { ORG_EMAIL } from "@/lib/org";

const DESCRIPTION =
  "Every cookie and browser-storage key this site sets, what it is for, and how to refuse the optional ones.";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: DESCRIPTION,
  alternates: { canonical: "/legal/cookies" },
};

/**
 * This site sets one cookie and one localStorage key, both strictly
 * necessary. That is unusual enough to be worth stating in a table rather
 * than in the vague categories most cookie policies use — a visitor can read
 * this page and then verify every row of it in their own devtools.
 */
const SECTIONS: LegalSection[] = [
  {
    title: "The short version",
    body: [
      "This site sets no advertising cookies, no cross-site tracking cookies, and no analytics cookies. There is no third-party tag manager, no pixel, and no data broker in the page.",
      "What it does set is one cookie needed to keep your AI Discovery Center sessions private to your browser, and one browser-storage key that remembers you dismissed the cookie notice. Both are listed in full below.",
    ],
  },
  {
    title: "Everything this site stores",
    body: [
      "The complete list. If you find something in your browser attributed to this domain that is not on this list, that is a bug — please report it.",
    ],
    table: {
      head: ["Name", "Purpose, type, and lifetime"],
      rows: [
        [
          OWNER_COOKIE_NAME,
          "Strictly necessary cookie. A random token identifying your browser as the owner of the discovery sessions you start, so the sidebar shows your conversations and nobody else's. HttpOnly, SameSite=Lax, Secure in production, and readable only by the server. Expires after 30 days. It contains no name, email, or device information — only a random value.",
        ],
        [
          COOKIE_NOTICE_KEY,
          "Strictly necessary browser localStorage key, not a cookie, so it is never sent to the server. Records that you dismissed the cookie notice so it does not reappear on every page. Persists until you clear site data.",
        ],
      ],
    },
  },
  {
    title: "Why there is no accept/reject choice",
    body: [
      "Consent banners exist to give you a real choice about optional tracking. There is no optional tracking here, so a banner offering to 'reject' would be theatre: rejecting would change nothing, because the only cookie is the one that keeps your own session data from being shown to another visitor.",
      "If analytics are ever added to this site, this page and the notice will change first, and a genuine opt-in will come with them.",
    ],
  },
  {
    title: "Refusing or removing them",
    body: [
      "You can block or delete both at any time through your browser's site-data controls, and you do not need our permission to do it.",
      "Removing the session cookie has one visible consequence: the discovery sidebar stops listing your previous conversations, because the browser can no longer prove they are yours. Any session URL you saved still works — those links are the capability, and they are unaffected.",
    ],
  },
  {
    title: "Third parties",
    body: [
      "Fonts are served from this domain, not from a font CDN, so no third party observes your visit through them. Some imagery is served from Google Cloud Storage, which receives the request for the image itself and nothing more; it sets no cookie on this site.",
      "Content you send to the AI Discovery Center is processed by a third-party large language model provider so the AI Architect can reply. That is described in the privacy policy, and it is a data-processing relationship rather than a cookie.",
    ],
  },
  {
    title: "Questions",
    body: [
      `Email ${ORG_EMAIL} and ask. Requests to have discovery sessions or lead records deleted are handled through the privacy policy.`,
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      path="/legal/cookies"
      title="Cookie Policy"
      intro={DESCRIPTION}
      notice="This document describes exactly what the site does today. It has not been reviewed by a lawyer and is not a substitute for one."
      updated="2026-08-13"
      sections={SECTIONS}
    />
  );
}
