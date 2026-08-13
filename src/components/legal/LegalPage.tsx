import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { pageSchema, type FaqEntry, type JsonLdNode } from "@/lib/schema";
import { routesInGroup } from "@/lib/routes";

export type LegalSection = {
  title: string;
  /** Paragraphs. Plain strings — no markup, so nothing here can inject. */
  body: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
  /** Optional two-column table; `head` labels the columns. */
  table?: { head: [string, string]; rows: [string, string][] };
};

/**
 * Shared chrome for every page under `/legal`.
 *
 * These pages differ only in their prose, so the layout, the JSON-LD, the
 * "last updated" line, and the cross-links between policies live here. Adding
 * a policy should mean writing sections, not copying a page.
 */
export function LegalPage({
  path,
  title,
  kicker = "Legal",
  intro,
  notice,
  updated,
  sections,
  faqs,
  extraSchema,
  children,
}: {
  path: string;
  title: string;
  kicker?: string;
  intro: string;
  /** Callout above the body — used for the "not legal advice" disclosure. */
  notice?: string;
  /** ISO date (YYYY-MM-DD) this document last changed. */
  updated: string;
  sections: LegalSection[];
  faqs?: FaqEntry[];
  extraSchema?: JsonLdNode[];
  children?: React.ReactNode;
}) {
  const schema = pageSchema({
    path,
    name: title,
    description: intro,
    breadcrumbs: [{ name: title, path }],
    faqs,
    extra: extraSchema,
  });

  const others = routesInGroup("legal").filter((route) => route.path !== path);
  const updatedLabel = new Date(`${updated}T00:00:00Z`).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" },
  );

  return (
    <>
      <JsonLd data={schema} />
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <SiteNav />

      <main id="main" className="bg-ink">
        <article className="pt-40 pb-24">
          <div className="container mx-auto px-6 max-w-3xl">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-6">
              {kicker}
            </p>
            <h1 className="text-5xl md:text-6xl font-black mb-6">{title}</h1>
            <p className="text-gray-400 mb-4">{intro}</p>
            <p className="text-sm text-gray-600 mb-8">
              Last updated{" "}
              <time dateTime={updated} className="text-gray-500">
                {updatedLabel}
              </time>
            </p>

            {notice && (
              <p className="glass-blue rounded-hex px-5 py-4 text-sm text-gray-300 mb-16">
                {notice}
              </p>
            )}

            <div className="space-y-12">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-2xl font-bold mb-4">{section.title}</h2>

                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-gray-400 mb-4">
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets && (
                    <ul className="space-y-2 mt-4">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="text-gray-400 pl-5 relative before:content-['—'] before:absolute before:left-0 before:text-gray-600"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.table && (
                    <div className="overflow-x-auto mt-6">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th
                              scope="col"
                              className="text-left py-3 pr-6 font-semibold text-gray-300 whitespace-nowrap"
                            >
                              {section.table.head[0]}
                            </th>
                            <th
                              scope="col"
                              className="text-left py-3 font-semibold text-gray-300"
                            >
                              {section.table.head[1]}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.table.rows.map(([key, value]) => (
                            <tr key={key} className="border-b border-white/5">
                              <th
                                scope="row"
                                className="text-left py-3 pr-6 font-mono text-xs text-sky-300 align-top whitespace-nowrap font-normal"
                              >
                                {key}
                              </th>
                              <td className="py-3 text-gray-400 leading-relaxed">
                                {value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              ))}
            </div>

            {children}

            <nav
              aria-label="Other policies"
              className="mt-20 pt-10 border-t border-white/5"
            >
              <h2 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-5">
                Other policies
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {others.map((route) => (
                  <li key={route.path}>
                    <Link
                      href={route.path}
                      className="glass rounded-xl px-5 py-4 block hover:border-white/20 transition-colors"
                    >
                      <span className="block text-sm font-semibold">
                        {route.title}
                      </span>
                      <span className="block text-xs text-gray-500 mt-1 leading-relaxed">
                        {route.summary}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
