import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/JsonLd";
import { pageSchema } from "@/lib/schema";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ORG_EMAIL } from "@/lib/org";

export const metadata: Metadata = pageMetadata({
  path: "/legal/terms",
  title: "Terms of Service",
  description:
    "The terms that apply to using the SoftwarePros website and its AI Discovery Center.",
});

const SECTIONS = [
  {
    title: "Using this site",
    body: [
      "You may read this site, submit enquiries, and use the AI Discovery Center for genuine project scoping. Please do not attempt to break, overload, or scrape it, and do not submit content you have no right to share.",
    ],
  },
  {
    title: "AI-generated output",
    body: [
      "The AI Architect produces draft architecture, requirements, and estimates. It is a starting point for a conversation, not professional advice, and it can be wrong. Nothing it generates is a quote, a contract, or a commitment to deliver.",
    ],
  },
  {
    title: "Your content",
    body: [
      "You keep ownership of everything you submit. You grant us permission to process it in order to respond to you and to generate summaries. Discovery summaries are reachable by anyone who has their link, so treat those links as private.",
    ],
  },
  {
    title: "Engagements",
    body: [
      "Actual work is governed by a separate signed agreement. Nothing on this site creates a client relationship on its own.",
    ],
  },
  {
    title: "No warranty",
    body: [
      "This site is provided as-is, without warranty of any kind. We are not liable for losses arising from reliance on its content or from downtime.",
    ],
  },
  {
    title: "Changes",
    body: [
      "These terms may change as the site develops. Continued use after a change means you accept the updated terms.",
    ],
  },
];

export default function TermsPage() {
  const schema = pageSchema({
    path: "/legal/terms",
    name: "Terms of Service",
    description:
      "The terms that apply to using the SoftwarePros website and its AI Discovery Center.",
    breadcrumbs: [{ name: "Terms of Service", path: "/legal/terms" }],
  });

  return (
    <>
      <JsonLd data={schema} />
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <SiteNav />

      <main id="main" className="bg-ink">
        <section className="pt-40 pb-24">
          <div className="container mx-auto px-6 max-w-3xl">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-6">
              Legal
            </p>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Terms of Service
            </h1>
            <p className="text-gray-400 mb-4">
              The ground rules for using this website.
            </p>
            <p className="glass-blue rounded-hex px-5 py-4 text-sm text-gray-300 mb-16">
              This is a placeholder for a site in development. It reflects how
              the site is intended to be used, but it has not been reviewed by a
              lawyer and is not a substitute for one.
            </p>

            <div className="space-y-12">
              {SECTIONS.map((section) => (
                <section key={section.title}>
                  <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-gray-400 mb-4">
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
            </div>

            <p className="text-sm text-gray-600 mt-16">
              Questions? <Link href="/contact" className="underline hover:text-gray-400">Contact us</Link> or email
              {" "}{ORG_EMAIL}. See also our{" "}
              <Link href="/legal/privacy" className="underline hover:text-gray-400">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
