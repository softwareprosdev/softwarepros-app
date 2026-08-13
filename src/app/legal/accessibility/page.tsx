import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { ORG_EMAIL } from "@/lib/org";

const DESCRIPTION =
  "The accessibility standard this site is built to, what is already implemented, what is still broken, and how to report a barrier.";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: DESCRIPTION,
  alternates: { canonical: "/legal/accessibility" },
};

/**
 * Written to be checkable. Every item under "What is in place" is something a
 * reader can confirm in devtools or with a keyboard in about a minute, and the
 * limitations section exists because a statement that lists only successes
 * tells you nothing about whether the site will work for you.
 */
const SECTIONS: LegalSection[] = [
  {
    title: "The standard, and what this page is not",
    body: [
      "This site is built against WCAG 2.2 Level AA. That is the target we design and review to — it is not a conformance claim. No third party has audited this site, there is no VPAT, and it has not been tested across a matrix of screen readers. Treat the list below as what has been done, not as a certificate.",
      "There is no accessibility overlay or widget here, and there will not be one. Overlays sit on top of the markup instead of fixing it, and they routinely fight the assistive technology you have already configured. The work belongs in the pages themselves.",
    ],
  },
  {
    title: "What is in place today",
    body: [
      "All of the following is in the code serving this page right now, not on a roadmap.",
    ],
    bullets: [
      "A 'Skip to main content' link as the first focusable element on every marketing and legal page, jumping past the navigation to the main landmark.",
      "Semantic landmarks on those pages: one main region, a labelled site navigation, a labelled 'Other policies' navigation on legal pages, and a footer.",
      "One h1 per page, with the rest of the headings nested in order beneath it — so a screen reader's heading list matches the visible structure.",
      "A visible focus ring on every focusable element: a 2px outline with a 3px offset, applied through :focus-visible. Focus styling is never suppressed, because a keyboard user who cannot see where they are cannot use the page at all.",
      "aria-current on the active navigation link, and aria-expanded on the mobile menu button, so the current page and the menu state are announced rather than only shown.",
      "Accessible names on every icon-only control — the menu toggle, the voice overlay's close button, the record button, and the attachment remove buttons — since an icon on its own announces as nothing.",
      "Real table markup with header cells and scope on both rows and columns, so cell values are read with the header they belong to.",
      "Decorative canvas and marquee elements marked aria-hidden, so they are skipped instead of read out as noise.",
      "Live regions where content arrives on its own: the voice transcript updates politely, and request failures are announced as alerts rather than only appearing on screen.",
      "Progress indicators in the discovery workspace expose a progressbar role with current, minimum and maximum values plus a label.",
      "Keyboard equivalents for everything the microphone does. The voice overlay closes on Escape and offers a 'Switch to Text' route, and the discovery centre is fully usable by typing.",
    ],
  },
  {
    title: "Motion",
    body: [
      "The animated backgrounds are decorative, and your operating system's reduced-motion preference is honoured — not partially, and not only in some components.",
      "A global rule collapses every animation and transition to effectively zero duration under prefers-reduced-motion: reduce. The particle field checks the same preference itself and paints a single static frame rather than looping faster, which is the failure mode a duration-only rule usually leaves behind.",
      "The scrolling logo marquee is decorative, marked aria-hidden, and stops under the same preference. Nothing on this site is only available while something is moving, and nothing auto-advances out from under you.",
    ],
  },
  {
    title: "Known limitations",
    body: [
      "Stated plainly, so you can decide whether this site will work for you before you hit the problem.",
    ],
    bullets: [
      "There is no light theme. The site declares itself dark-only and does not respond to a light or high-contrast preference. If a dark background is a barrier for you, your browser's or operating system's forced-colours mode is the only workaround, and it has not been tested here.",
      "Some secondary text uses the dimmest greys in the palette — timestamps, captions, footnotes. That text has not been measured against the 4.5:1 contrast minimum, so assume some of it falls short until it is fixed.",
      "The voice overlay identifies itself as a modal dialog and closes on Escape, but it does not trap focus inside itself and does not return focus to the button that opened it. Tab can move to content behind the overlay.",
      "Voice input depends on the browser's SpeechRecognition API, which Chrome, Edge and Safari implement and Firefox does not. Where it is missing the overlay says so and offers typed entry, rather than appearing to listen and silently discarding what you said. Voice is never the only route to anything.",
      "The AI Discovery Center workspace is an application view rather than a document: it has no skip link and no page-level h1. It is operable by keyboard, but it has had markedly less assistive-technology review than the rest of the site.",
      "There is no automated accessibility check in the build and no test suite covering this. Everything above came from manual review, which means regressions are possible between releases.",
    ],
  },
  {
    title: "Reporting a barrier",
    body: [
      `If something here blocks you, email ${ORG_EMAIL}. Include the page you were on, what you were trying to do, and which browser and assistive technology you were using — that is usually enough to reproduce it without a second exchange.`,
      "A person replies. Small fixes ship with the next deploy; anything larger gets an honest answer about what it will take, rather than being filed as 'on the roadmap'.",
      "If you need information from a page you cannot currently use, ask for it and it will be sent in a format that works for you — plain text or email.",
    ],
  },
];

export default function AccessibilityStatementPage() {
  return (
    <LegalPage
      path="/legal/accessibility"
      title="Accessibility Statement"
      intro={DESCRIPTION}
      notice="This describes the site as it is today, including the parts that do not yet meet the target. It is a statement of intent and current state, not a certified conformance claim."
      updated="2026-08-13"
      sections={SECTIONS}
    />
  );
}
