"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Wordmark } from "@/components/SiteNav";

/**
 * Creates a session via the API (which sets the owner cookie), then forwards.
 *
 * `query` seeds the session's first message. That is what backs the
 * `SearchAction` in the site's structured data — an engine or a deep link can
 * send someone to `/discovery?q=…` and they land mid-conversation rather than
 * at an empty prompt.
 */
export function DiscoveryBootstrap({
  mode,
  query,
}: {
  mode?: "upload";
  query?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query ? { message: query } : {}),
        });
        if (!res.ok) throw new Error("Could not start a session");
        const { publicId } = await res.json();
        if (cancelled) return;
        router.replace(
          `/discovery/${publicId}${mode === "upload" ? "?mode=upload" : ""}`,
        );
      } catch {
        if (!cancelled) {
          setError(
            "Could not start a discovery session. Check your connection and try again.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, mode, query]);

  return (
    <div className="min-h-dvh flex flex-col">
      <nav className="h-14 shrink-0 flex items-center px-6 border-b border-white/5">
        <Wordmark className="text-lg" />
      </nav>
      <main className="flex-1 flex items-center justify-center px-6">
        {error ? (
          <div className="text-center max-w-md">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto mb-5">
              <Icon name="triangle-exclamation" className="text-red-400" />
            </div>
            <h1 className="text-xl font-bold mb-2">Couldn&apos;t start a session</h1>
            <p className="text-sm text-gray-400 mb-6">{error}</p>
            <Link
              href="/"
              className="px-6 py-3 border border-white/15 rounded-full text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-cyan-500/20 animate-pulse-ring" />
              <Icon name="brain" className="text-2xl text-cyan-400" />
            </div>
            <p className="text-sm text-gray-400">
              Waking the AI Architect…
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
