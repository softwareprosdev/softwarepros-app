"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Wordmark } from "@/components/SiteNav";

/**
 * Segment-level error boundary for every route below the root layout.
 *
 * Note the `retry` prop — this version of Next passes `retry`, not the
 * `reset` from older App Router docs. Calling it re-renders the boundary's
 * children, which is a real recovery path here: the failures this catches
 * are mostly transient (a Prisma connection blip, an Anthropic timeout).
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      <nav
        aria-label="Site"
        className="w-full px-6 py-4 flex items-center gap-4 border-b border-white/5"
      >
        <Wordmark />
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="glass rounded-2xl p-10 max-w-lg text-center">
          <Icon
            name="triangle-exclamation"
            className="text-amber-400 text-2xl mb-4 block"
          />
          <h1 className="text-2xl font-bold mb-3">Something broke on our end</h1>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            This one is ours, not yours. The error has been logged. Trying again
            usually clears it — if it doesn&apos;t, get in touch and we&apos;ll
            take a look.
          </p>

          {error.digest && (
            <p className="font-mono text-xs text-gray-600 mb-8">
              Reference: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => retry()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <Icon name="rotate-right" className="mr-2" />
              Try Again
            </button>
            <Link
              href="/contact"
              className="px-6 py-3 border border-white/10 rounded-full text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
