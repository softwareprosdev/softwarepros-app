import type { Metadata } from "next";
import { DiscoveryBootstrap } from "@/components/discovery/DiscoveryBootstrap";

export const metadata: Metadata = {
  title: "AI Discovery Center",
  description:
    "Describe your business problem and the SoftwarePros AI Architect will turn it into an engineer-ready system definition.",
  // Every GET here mints a session and forwards; there is nothing to index.
  robots: { index: false, follow: false },
};

/**
 * `/discovery` has no UI of its own — it mints a session and forwards to it so
 * every conversation gets a stable, shareable URL. Session creation goes
 * through the API route rather than happening here because it needs to set the
 * owner cookie, which a Server Component cannot do.
 */
export default async function DiscoveryIndex({
  searchParams,
}: PageProps<"/discovery">) {
  const { mode, q } = await searchParams;
  // `q` is the SearchAction entry point declared in the site's structured
  // data; trimmed and length-capped here so a crafted link cannot post a
  // 100 KB first message. The API validates it again regardless.
  const query = typeof q === "string" ? q.trim().slice(0, 2000) : undefined;

  return (
    <DiscoveryBootstrap
      mode={mode === "upload" ? "upload" : undefined}
      query={query || undefined}
    />
  );
}
