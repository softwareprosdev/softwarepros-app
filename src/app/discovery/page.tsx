import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { DiscoveryIntakeForm } from "@/components/discovery/DiscoveryIntakeForm";
import { JsonLd } from "@/components/JsonLd";
import { pageSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  path: "/discovery",
  title: "Start a Project",
  description:
    "Tell SoftwarePros what you're building — the project, the goals, the budget and timeline — and a Senior Software Architect follows up directly.",
});

export default async function DiscoveryPage({
  searchParams,
}: PageProps<"/discovery">) {
  const { q } = await searchParams;
  // `q` is the SearchAction entry point declared in the site's structured
  // data; trimmed and length-capped here so a crafted link cannot pre-fill a
  // 100 KB description. The API caps it again regardless.
  const query = typeof q === "string" ? q.trim().slice(0, 2000) : undefined;

  const schema = pageSchema({
    path: "/discovery",
    type: "ContactPage",
    name: "Start a Project | SoftwarePros",
    description:
      "Tell SoftwarePros what you're building so a Senior Software Architect can follow up with next steps.",
    breadcrumbs: [{ name: "Start a Project", path: "/discovery" }],
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
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-6">
                Start a project
              </p>
              <h1 className="text-5xl md:text-7xl font-black leading-[0.95] mb-8">
                Tell Us What
                <br />
                You&apos;re Building.
              </h1>
              <p className="text-lg text-gray-400">
                Describe the project in your own words. An engineer reads
                every submission and follows up directly — no forms to
                shuffle through, no sales queue.
              </p>
            </div>

            <DiscoveryIntakeForm initialDescription={query} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
