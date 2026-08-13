import { SITE_URL } from "@/lib/site";
import {
  ORG_DESCRIPTION,
  ORG_DISCIPLINES,
  ORG_EMAIL,
  ORG_ID,
  ORG_LEGAL_NAME,
  ORG_NAME,
  ORG_PROFILES,
  WEBSITE_ID,
} from "@/lib/org";
import { INDUSTRIES, SERVICES } from "@/lib/content";

/**
 * Schema.org entity graph.
 *
 * Every page emits ONE `@graph` rather than a pile of disconnected blocks, so
 * the nodes reference each other by `@id` and a crawler resolves a single
 * organization, a single website, and one page hanging off both. Node ids are
 * stable URLs with fragments — that is what makes `@id` linkage work across
 * pages instead of within one document.
 */

export type JsonLdNode = Record<string, unknown>;

/** Absolute URL for a site-relative path. */
export function abs(path: string): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

/* ── Root entities (identical on every page, hence the shared ids) ──── */

const LOGO_ID = `${SITE_URL}/#logo`;

/**
 * The logo is a top-level node rather than an object nested inside
 * `organization.logo`. Both the organization and every WebPage point at it by
 * `@id`, and a reference only resolves if the node it names is reachable in
 * the graph — a nested definition leaves those references dangling.
 */
function logo(): JsonLdNode {
  return {
    "@type": "ImageObject",
    "@id": LOGO_ID,
    url: `${SITE_URL}/opengraph-image`,
    contentUrl: `${SITE_URL}/opengraph-image`,
    width: 1200,
    height: 630,
    caption: ORG_NAME,
  };
}

function organization(): JsonLdNode {
  const node: JsonLdNode = {
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: ORG_NAME,
    legalName: ORG_LEGAL_NAME,
    url: abs("/"),
    description: ORG_DESCRIPTION,
    email: ORG_EMAIL,
    logo: { "@id": LOGO_ID },
    image: { "@id": LOGO_ID },
    knowsAbout: [
      ...ORG_DISCIPLINES,
      ...SERVICES.map((s) => s.title),
      ...INDUSTRIES.map((i) => `${i.name} software`),
    ],
    areaServed: { "@type": "Country", name: "United States" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: ORG_EMAIL,
      url: abs("/contact"),
      availableLanguage: "English",
    },
  };

  // Omitted rather than emitted empty: `sameAs: []` tells a crawler nothing,
  // and a placeholder URL would tell it something false. See `org.ts`.
  if (ORG_PROFILES.length > 0) {
    node.sameAs = ORG_PROFILES.map((p) => p.href);
  }

  return node;
}

function website(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: abs("/"),
    name: ORG_NAME,
    description: ORG_DESCRIPTION,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
    // Points at a real handler: `/discovery?q=` seeds the AI Architect with
    // the query. A SearchAction aimed at a route that ignores the parameter
    // is worse than none at all.
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/discovery?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/* ── Per-page entities ──────────────────────────────────────────────── */

export type Crumb = { name: string; path: string };

function breadcrumbList(pagePath: string, crumbs: Crumb[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    "@id": `${abs(pagePath)}#breadcrumb`,
    itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map(
      (crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        item: abs(crumb.path),
      }),
    ),
  };
}

export type FaqEntry = { question: string; answer: string };

function faqPage(pagePath: string, faqs: FaqEntry[]): JsonLdNode {
  return {
    "@type": "FAQPage",
    "@id": `${abs(pagePath)}#faq`,
    isPartOf: { "@id": `${abs(pagePath)}#webpage` },
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** The `Service` node for one of the 20 disciplines. */
export function serviceNode(slug: string): JsonLdNode | null {
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return null;
  return {
    "@type": "Service",
    "@id": `${abs("/solutions")}#service-${service.slug}`,
    name: service.title,
    description: service.description,
    serviceType: service.title,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "United States" },
    audience: {
      "@type": "BusinessAudience",
      name: "Organizations commissioning custom software",
    },
  };
}

/* ── Graph assembly ─────────────────────────────────────────────────── */

export type PageSchemaOptions = {
  /** Site-relative path, e.g. `/solutions`. */
  path: string;
  name: string;
  description: string;
  /** Trail after Home; Home is prepended automatically. */
  breadcrumbs?: Crumb[];
  faqs?: FaqEntry[];
  /** Service slugs this page is the canonical description of. */
  services?: string[];
  /** Extra nodes (Article, ItemList, …) merged into the same graph. */
  extra?: JsonLdNode[];
  /** Page type override; defaults to `WebPage`. */
  type?: string;
};

export function pageSchema({
  path,
  name,
  description,
  breadcrumbs = [],
  faqs = [],
  services = [],
  extra = [],
  type = "WebPage",
}: PageSchemaOptions): JsonLdNode {
  const url = abs(path);
  const serviceNodes = services
    .map(serviceNode)
    .filter((n): n is JsonLdNode => n !== null);

  const webPage: JsonLdNode = {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    inLanguage: "en-US",
    breadcrumb: { "@id": `${url}#breadcrumb` },
    primaryImageOfPage: { "@id": LOGO_ID },
  };

  // `mentions` is what ties a page to the entities it discusses, which is the
  // link AI answer engines follow when deciding what this page is evidence of.
  const mentioned = [
    ...serviceNodes.map((n) => ({ "@id": n["@id"] })),
    ...extra
      .filter((n) => typeof n["@id"] === "string")
      .map((n) => ({ "@id": n["@id"] })),
  ];
  if (mentioned.length > 0) webPage.mentions = mentioned;
  if (faqs.length > 0) webPage.significantLink = `${url}#faq`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      logo(),
      organization(),
      website(),
      webPage,
      breadcrumbList(path, breadcrumbs),
      ...(faqs.length > 0 ? [faqPage(path, faqs)] : []),
      ...serviceNodes,
      ...extra,
    ],
  };
}
