"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Wordmark } from "@/components/SiteNav";
import { ORG_EMAIL, ORG_PHONE_DISPLAY, ORG_PHONE_E164 } from "@/lib/org";

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
  const [retrying, setRetrying] = useState(true);
  const startedRef = useRef(false);

  const startSession = useCallback(async () => {
    setError(null);
    setRetrying(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query ? { message: query } : {}),
      });

      if (!res.ok) {
        // 503 is the server saying its own dependency is down. Anything else
        // reaching here is unexpected, but either way the visitor did nothing
        // wrong — the old copy told them to check their connection, which
        // sent people to reboot a router over our database being unreachable.
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : "The discovery service is temporarily unavailable. This is on our side, not yours.",
        );
      }

      const { publicId } = await res.json();
      router.replace(
        `/discovery/${publicId}${mode === "upload" ? "?mode=upload" : ""}`,
      );
    } catch (err) {
      setRetrying(false);
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Could not reach the discovery service. Check your connection and try again.",
      );
    }
  }, [router, mode, query]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void startSession();
  }, [startSession]);

  return (
    <div className="min-h-dvh flex flex-col">
      <nav className="h-14 shrink-0 flex items-center px-6 border-b border-white/5">
        <Wordmark className="text-lg" />
      </nav>
      <main className="flex-1 flex items-center justify-center px-6">
        {error ? (
          <div className="text-center max-w-lg">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto mb-5">
              <Icon name="triangle-exclamation" className="text-red-400" />
            </div>
            <h1 className="text-xl font-bold mb-2">
              The AI Architect is offline
            </h1>
            <p className="text-sm text-gray-400 mb-6" role="alert">
              {error}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button
                type="button"
                onClick={() => void startSession()}
                disabled={retrying}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Icon
                  name={retrying ? "spinner" : "rotate-right"}
                  spin={retrying}
                  className="mr-2"
                />
                {retrying ? "Retrying…" : "Try again"}
              </button>
              <Link
                href="/contact"
                className="px-6 py-3 border border-white/15 rounded-full text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                Talk to a person instead
              </Link>
            </div>

            {/* A dead end here loses the lead outright, so the fallback route
                to a human is offered rather than just "back to home". */}
            <p className="text-xs text-gray-600">
              You can also email{" "}
              <a
                href={`mailto:${ORG_EMAIL}`}
                className="underline hover:text-gray-400"
              >
                {ORG_EMAIL}
              </a>{" "}
              or call{" "}
              <a
                href={`tel:${ORG_PHONE_E164}`}
                className="underline hover:text-gray-400"
              >
                {ORG_PHONE_DISPLAY}
              </a>
              .{" "}
              <Link href="/" className="underline hover:text-gray-400">
                Back to home
              </Link>
            </p>
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
