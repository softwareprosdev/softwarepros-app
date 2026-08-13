import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/JsonLd";
import { pageSchema } from "@/lib/schema";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = pageMetadata({
  path: "/legal/privacy",
  title: "Privacy Policy",
  description:
    "What SoftwarePros collects when you use this site, why, and how to have it deleted.",
});

const SECTIONS = [
  {
    title: "What we collect",
    body: [
      "Contact details you type into a form on this site: name, work email, and optionally company, phone number, timeline, and whatever you write in the message field.",
      "The content of AI Discovery Center conversations, including any documents or images you upload, so the summary can be generated and revisited from its link.",
      "An email address if you subscribe to the newsletter.",
    ],
  },
  {
    title: "Why we collect it",
    body: [
      "To reply to your enquiry and to prepare for the conversation that follows. We do not sell your data, and we do not share it with advertisers.",
      "Discovery conversations are processed by a third-party large language model provider so the AI Architect can respond. Do not paste credentials, patient data, or anything else you would not send in an email.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "Lead records and discovery sessions are retained while they are commercially relevant and deleted on request.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "Email hello@softwarepros.org to ask what we hold about you, to correct it, or to have it deleted. Newsletter emails can be unsubscribed from at any time.",
    ],
  },
  {
    title: "Cookies and analytics",
    body: [
      "This site sets no advertising or cross-site tracking cookies.",
    ],
  },
];

export default function PrivacyPage() {
  const schema = pageSchema({
    path: "/legal/privacy",
    name: "Privacy Policy",
    description:
      "What SoftwarePros collects when you use this site, why, and how to have it deleted.",
    breadcrumbs: [{ name: "Privacy Policy", path: "/legal/privacy" }],
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
              Privacy Policy
            </h1>
            <p className="text-gray-400 mb-4">
              Plain-language summary of what this site does with your
              information.
            </p>
            <p className="glass-blue rounded-hex px-5 py-4 text-sm text-gray-300 mb-16">
              This is a placeholder policy for a site in development. It
              describes what the site actually does today, but it has not been
              reviewed by a lawyer and is not a substitute for one.
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
              hello@softwarepros.org. See also our{" "}
              <Link href="/legal/terms" className="underline hover:text-gray-400">
                terms of service
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
