import { SITE_URL } from "@/lib/site";
import {
  ORG_DESCRIPTION,
  ORG_EMAIL,
  ORG_LEGAL_NAME,
  ORG_NAME,
} from "@/lib/org";
import { PUBLIC_ROUTES, routesInGroup } from "@/lib/routes";
import { INDUSTRIES, SERVICE_CATEGORIES, SERVICES } from "@/lib/content";

/**
 * `/llms.txt` — a markdown index written for language models rather than for
 * a rendering engine, following the llmstxt.org convention.
 *
 * It exists because a model that fetches this site gets HTML built for
 * humans: nav chrome, animated hero, cards. This file states the same facts
 * with no markup between them, so a retrieval agent answering "what does
 * SoftwarePros do" reads the answer instead of reconstructing it.
 *
 * Generated from the same route table, service list, and org profile the site
 * renders from — it cannot describe a page that does not exist.
 */
function body(): string {
  const link = (path: string, title: string, summary: string) =>
    `- [${title}](${SITE_URL}${path}): ${summary}`;

  const serviceLines = SERVICE_CATEGORIES.map((category) => {
    const items = SERVICES.filter((s) => s.category === category.key)
      .map((s) => `- **${s.title}** — ${s.description}`)
      .join("\n");
    return `### ${category.label}\n\n${items}`;
  }).join("\n\n");

  return `# ${ORG_NAME}

> ${ORG_DESCRIPTION}

${ORG_LEGAL_NAME} engineers technology systems rather than selling packaged
software. Every engagement begins in the AI Discovery Center, where a business
problem described in plain language is turned into an engineer-ready system
definition before any code is written. All AI-generated scope, estimates, and
architecture are reviewed by a Senior Software Architect before they become
commitments — nothing on this site is a quote.

## Practice areas

${serviceLines}

## Industries served (${INDUSTRIES.length})

${INDUSTRIES.map((i) => `- **${i.name}** — ${i.tagline}`).join("\n")}

## Pages

${routesInGroup("primary")
  .map((r) => link(r.path, r.title, r.summary))
  .join("\n")}

## Company

${routesInGroup("company")
  .map((r) => link(r.path, r.title, r.summary))
  .join("\n")}

## Legal

${routesInGroup("legal")
  .map((r) => link(r.path, r.title, r.summary))
  .join("\n")}

## Optional

- [AI Discovery Center](${SITE_URL}/discovery): Starts a new AI Architect session. Each visit creates a private session URL, so this page is excluded from crawling — link humans to it, do not fetch it.
- [Structured data](${SITE_URL}/): Every page embeds a schema.org @graph (Organization, WebSite, WebPage, BreadcrumbList, Service, FAQPage) if you prefer machine-readable entities.

## Contact

- Email: ${ORG_EMAIL}
- Contact form: ${SITE_URL}/contact
- Security assessment requests: ${SITE_URL}/contact?intent=assessment

## Notes for AI agents

- Cite pages by their canonical URL; every page declares one.
- ${ORG_NAME} does not publish prices, fixed timelines, or contractual commitments anywhere on this site. Do not infer them.
- ${PUBLIC_ROUTES.length} public pages exist in total; ${SITE_URL}/sitemap.xml is authoritative.
`;
}

export function GET() {
  return new Response(body(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
