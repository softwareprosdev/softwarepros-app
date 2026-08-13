import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { SECURITY_EMAIL } from "@/lib/org";

const DESCRIPTION =
  "The controls protecting data on this site, and the responsible disclosure policy for reporting a vulnerability in it.";

export const metadata: Metadata = pageMetadata({
  path: "/legal/security",
  title: "Security & Disclosure",
  description: DESCRIPTION,
});

/**
 * This is the `Policy:` URL published in `/.well-known/security.txt`, so the
 * scope and safe-harbour wording below must stay in step with
 * `src/app/security.txt/route.ts`. A researcher who reads one and acts on the
 * other should not be able to end up outside the policy.
 */
const SECTIONS: LegalSection[] = [
  {
    title: "The short version",
    body: [
      "This page describes controls that are actually deployed. It claims no certification, no audit, and no compliance attestation, because none has been done — inventing one would be the first thing worth reporting.",
      "If you have found a vulnerability, skip to 'Reporting a vulnerability' at the bottom. Everything above it is context.",
    ],
  },
  {
    title: "Browser and transport hardening",
    body: [
      "Every response from this domain carries the headers below. They exist to shrink what a bug elsewhere can be turned into: an injected script that cannot reach an external origin cannot exfiltrate anything, and a page that cannot be framed cannot be clickjacked.",
    ],
    table: {
      head: ["Header", "Value and why"],
      rows: [
        [
          "Content-Security-Policy",
          "default-src 'self' with object-src 'none', base-uri 'self', form-action 'self', and frame-ancestors 'none'. connect-src is limited to this origin, so no script on the page can post data to a third party. Images are restricted to this origin, data/blob URLs, and storage.googleapis.com, which serves the design imagery. Styles and scripts do allow 'unsafe-inline' — Next.js inlines critical CSS and the design uses inline style attributes — so the CSP is a defence-in-depth layer here, not a complete XSS mitigation. 'unsafe-eval' is added in development only, for React Refresh, and is absent in production.",
        ],
        [
          "Strict-Transport-Security",
          "max-age=63072000; includeSubDomains; preload. Two years, subdomains included, preload-eligible — so a downgrade to plain HTTP is refused by the browser rather than depending on a redirect that an attacker on the network can intercept first.",
        ],
        [
          "X-Frame-Options",
          "DENY, alongside frame-ancestors 'none', for browsers that honour only one of the two.",
        ],
        [
          "X-Content-Type-Options",
          "nosniff. An uploaded text file must never be re-interpreted by the browser as something executable.",
        ],
        [
          "Referrer-Policy",
          "strict-origin-when-cross-origin. This matters more than usual here: discovery and summary URLs are capability links, and a full referrer would leak the id to every off-site link you follow.",
        ],
        [
          "Permissions-Policy",
          "camera=(), geolocation=(), microphone=(self). The discovery centre needs the microphone; the camera and your location are switched off at the platform level so no code on this site can ask for them.",
        ],
        [
          "Cache-Control",
          "private, no-store, max-age=0 on /discovery, /summary and /admin. Those responses contain one person's data, so they are kept out of shared proxies and CDN caches.",
        ],
      ],
    },
  },
  {
    title: "Capability URLs, and what that means for you",
    body: [
      "Discovery sessions and project summaries are reached through unguessable links rather than accounts. There is no password to create and no login to forget, which is the point — but it means the link is the credential.",
      "Each id is 14 characters drawn from a 33-character alphabet using the platform CSPRNG (crypto.getRandomValues), giving roughly seventy bits of randomness. That is not guessable by brute force, but it is copyable. Anyone you send the link to can open the conversation, and so can anyone they forward it to. Treat a session URL like a password: share it deliberately, and assume a link posted in a public channel is public.",
      "These paths are excluded from the sitemap and disallowed in robots.txt for every crawler, including the AI agents named there, so the ids do not end up in a search index or a training set. That is a precaution, not a protection — robots.txt is a request, and the only real control is who you give the link to.",
      "One cookie supports this. It holds a random token, nothing else — no name, no email, no device fingerprint — and it exists so the sidebar can list the sessions your browser started and not somebody else's. It is HttpOnly, SameSite=Lax, Secure in production, and expires after 30 days. Clearing it does not revoke your links; it only stops the sidebar from listing them.",
    ],
  },
  {
    title: "Server-side controls",
    body: [
      "The client is not trusted with anything. Each control below covers a specific failure that has burned other people's applications.",
    ],
    bullets: [
      "Every request body is parsed with a Zod schema before it reaches application logic or the database — session creation, chat, summaries, leads, newsletter signups, and admin lead updates. Anything that does not match the schema is rejected rather than coerced.",
      "The admin area is behind HTTP Basic auth, enforced at the proxy for both /admin/* and /api/admin/*. It fails closed: if no admin password is configured, the deployment is locked rather than open, and there is no default credential to fall back to.",
      "Credentials are hashed and then compared with a timing-safe comparison, with both the username and the password always checked so nothing short-circuits and reveals which half was wrong. Submitted credentials are never logged.",
      "Uploads are capped at 10 MB and restricted by type: JPEG, PNG, GIF and WebP images, PDFs, and text documents (txt, md, csv, json, xml, yaml, log, tsv). Anything else is refused with a 415. Text is truncated on ingest, and an upload is only accepted against a session that already exists.",
      "Per-IP rate limits on every public write path — 20 a minute for chat and uploads, 15 for new sessions, 10 for leads and newsletter signups, 5 for summary generation. These bound casual abuse and runaway model spend. The client identity comes from a forwarded header that is spoofable without a trusted proxy in front, so this is a speed bump and never an authorisation decision.",
      "Admin pages are noindex and no-store, so lead PII cannot leak into a search index or an intermediary cache.",
    ],
  },
  {
    title: "What we do not protect you from",
    body: [
      "Content you send to the AI Discovery Center is processed by a third-party large language model provider so the AI Architect can reply. Do not paste credentials, API keys, patient data, or anything else you would not put in an email. No control on this page changes that.",
      "The rate limiter runs in memory on a single instance: it does not survive a restart and does not coordinate across replicas. It is sized to stop abuse, not a determined attacker.",
      "Nothing here defends against a compromised endpoint on your side. If your machine or your mailbox is owned, so is any capability link that has ever reached it.",
    ],
  },
  {
    title: "Reporting a vulnerability",
    body: [
      `Email ${SECURITY_EMAIL}. The same address is published in /.well-known/security.txt, which points its Policy field at this page.`,
      "Tell us before you tell anyone else, and we will work the report rather than the reporter. We do not pursue legal action against researchers who act in good faith under this policy — meaning you stay within the scope below, you do not access, alter or destroy other people's data, you do not degrade the service, and you give us a reasonable chance to fix the issue before publishing.",
      "There is no bug bounty and no payment. Saying so up front is fairer than letting you spend an afternoon on the assumption that there is one. Credit is offered on request when a report leads to a fix.",
    ],
    table: {
      head: ["Target", "Status"],
      rows: [
        [
          "This site",
          "In scope — softwarepros.org and everything served from it, including the AI Discovery Center and its API routes.",
        ],
        [
          "Admin surface",
          "In scope, tested without brute-forcing credentials and without accessing, altering or exfiltrating real lead records.",
        ],
        [
          "Denial of service",
          "Out of scope, along with volumetric testing and automated scanning of any kind.",
        ],
        [
          "Social engineering",
          "Out of scope. Do not phish or pretext staff or clients. Physical attacks are out of scope for the same reason.",
        ],
        [
          "Scanner output",
          "Out of scope when submitted raw. A report produced solely by an automated scanner with no demonstrated impact — a missing header on an endpoint where it does not apply, a best-practice finding with no exploit path — will be closed.",
        ],
      ],
    },
  },
  {
    title: "What a good report contains",
    body: [
      "Enough to reproduce the issue without a round of questions. Reports that arrive complete get fixed first, simply because they can be.",
    ],
    bullets: [
      "The affected URL, and the exact steps to reproduce.",
      "What an attacker gains — the impact matters more than the class of bug.",
      "Any request or response needed to see it, with the payload you used.",
      "If a discovery session or project summary URL is involved, send the id. Those URLs are capability links, and yours will be treated as confidential.",
      "Your preferred name if you would like credit, or a note that you would rather stay anonymous.",
    ],
  },
];

export default function SecurityPolicyPage() {
  return (
    <LegalPage
      path="/legal/security"
      title="Security & Disclosure"
      intro={DESCRIPTION}
      notice="This document describes controls that are deployed today. It is not a certification, an audit result, or a compliance attestation, and it makes no claim to be one."
      updated="2026-08-13"
      sections={SECTIONS}
    />
  );
}
