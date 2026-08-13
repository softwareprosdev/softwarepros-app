/**
 * The public route table.
 *
 * `sitemap.ts`, `/llms.txt`, `/ai.txt` and the site footer all read from here.
 * Before this existed the same list was maintained in four places, which is
 * exactly the kind of drift that ends with a page in the footer but not the
 * sitemap.
 *
 * Capability URLs (`/discovery/{id}`, `/summary/{id}`) and `/admin` are
 * absent by design — see `robots.ts`.
 */

export type PublicRoute = {
  path: string;
  title: string;
  /** One line, written to stand alone in a sitemap or an AI index. */
  summary: string;
  group: "primary" | "company" | "legal";
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
};

export const PUBLIC_ROUTES: PublicRoute[] = [
  {
    path: "/",
    title: "Home",
    summary:
      "SoftwarePros builds AI systems, custom software, cybersecurity programs, and cloud infrastructure across 20 engineering disciplines and 15 industries.",
    group: "primary",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/solutions",
    title: "Solutions",
    summary:
      "All 20 engineering disciplines, grouped into AI, software engineering, security and infrastructure, business systems, and industry-specific systems.",
    group: "primary",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/solutions/cybersecurity",
    title: "Cybersecurity",
    summary:
      "Offensive security, defensive architecture, and security operations — penetration testing, compliance implementation, threat detection, and incident response.",
    group: "primary",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/industries",
    title: "Industries",
    summary:
      "The 15 industries served, and what SoftwarePros builds for each — including the regulatory and integration realities specific to those sectors.",
    group: "primary",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/about",
    title: "About",
    summary:
      "How SoftwarePros works: discovery before code, security as a design constraint, and engineers who own systems end to end.",
    group: "company",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/careers",
    title: "Careers",
    summary:
      "How to join SoftwarePros — what the engineering bar is, how hiring works, and how to apply.",
    group: "company",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    path: "/contact",
    title: "Contact",
    summary:
      "Request a security assessment, book a discovery call, or start a project with the SoftwarePros engineering team.",
    group: "company",
    changeFrequency: "yearly",
    priority: 0.7,
  },
  {
    path: "/legal/privacy",
    title: "Privacy Policy",
    summary:
      "What SoftwarePros collects when you use this site, why, how long it is kept, and how to have it deleted.",
    group: "legal",
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    path: "/legal/terms",
    title: "Terms of Service",
    summary:
      "The terms that apply to using the SoftwarePros website and its AI Discovery Center.",
    group: "legal",
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    path: "/legal/cookies",
    title: "Cookie Policy",
    summary:
      "Every cookie and browser-storage key this site sets, what it is for, and how to refuse the optional ones.",
    group: "legal",
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    path: "/legal/accessibility",
    title: "Accessibility Statement",
    summary:
      "The accessibility standard this site targets, what is known to fall short, and how to report a barrier.",
    group: "legal",
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    path: "/legal/security",
    title: "Security & Disclosure",
    summary:
      "How SoftwarePros protects this site's data and how to report a vulnerability in it responsibly.",
    group: "legal",
    changeFrequency: "yearly",
    priority: 0.2,
  },
];

export function routesInGroup(group: PublicRoute["group"]): PublicRoute[] {
  return PUBLIC_ROUTES.filter((route) => route.group === group);
}
