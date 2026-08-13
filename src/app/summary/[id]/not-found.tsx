import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Wordmark } from "@/components/SiteNav";

export default function SummaryNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav
        aria-label="Project summary"
        className="w-full px-6 py-4 flex items-center gap-4 border-b border-white/5"
      >
        <Wordmark />
        <span className="h-4 w-px bg-white/10" aria-hidden="true" />
        <span className="text-sm text-gray-400">AI Project Summary</span>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="glass rounded-2xl p-10 max-w-lg text-center">
          <Icon
            name="triangle-exclamation"
            className="text-amber-400 text-2xl mb-4 block"
          />
          <h1 className="text-2xl font-bold mb-3">Summary not found</h1>
          <p className="text-sm text-gray-400 mb-8">
            This project summary link is invalid or has expired. Start a new
            discovery session and the AI Architect will generate a fresh one.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/discovery"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Start A Discovery Session
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-white/10 rounded-full text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all"
            >
              Back To Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
