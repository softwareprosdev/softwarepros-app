import { Icon } from "@/components/Icon";
import { Wordmark } from "@/components/SiteNav";

/**
 * Instant shell for the discovery workspace. The page is `force-dynamic` and
 * makes two Prisma round-trips before it can render, so this holds the exact
 * three-pane geometry of DiscoveryWorkspace — chrome first, panes as bars —
 * and the real workspace swaps in without the layout jumping.
 */
function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-white/5 animate-pulse ${className}`} />;
}

export default function DiscoveryLoading() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden" aria-busy="true">
      <nav className="h-14 shrink-0 w-full flex justify-between items-center px-6 border-b border-white/5 bg-ink/90 backdrop-blur-md">
        <div className="flex items-center gap-6 min-w-0">
          <Wordmark className="text-lg" />
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <span className="text-sm text-gray-400 font-medium hidden sm:block">
            AI Discovery Center
          </span>
        </div>
        <Bar className="h-8 w-32 rounded-full" />
      </nav>

      <div className="flex flex-1 min-h-0">
        <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/5 flex-col bg-panel p-4 gap-3">
          <Bar className="h-9 w-full rounded-lg" />
          <Bar className="h-9 w-full rounded-lg" />
          <div className="h-4" />
          <Bar className="h-3 w-24" />
          {[0, 1, 2, 3].map((i) => (
            <Bar key={i} className="h-12 w-full rounded-lg" />
          ))}
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-12 shrink-0 flex items-center gap-3 px-6 border-b border-white/5 bg-ink/50">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
              <Icon name="brain" className="text-xs text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                SoftwarePros AI Architect
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Icon name="spinner" spin />
                Restoring your session…
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-4 md:p-6 space-y-6">
            <div className="max-w-2xl space-y-2">
              <Bar className="h-4 w-11/12" />
              <Bar className="h-4 w-4/5" />
              <Bar className="h-4 w-2/3" />
            </div>
            <div className="max-w-md ml-auto space-y-2">
              <Bar className="h-4 w-full" />
              <Bar className="h-4 w-3/5 ml-auto" />
            </div>
            <div className="max-w-2xl space-y-2">
              <Bar className="h-4 w-10/12" />
              <Bar className="h-4 w-9/12" />
            </div>
          </div>

          <div className="shrink-0 p-4 md:p-6 border-t border-white/5">
            <Bar className="h-14 w-full rounded-xl" />
          </div>
        </div>

        <aside className="hidden xl:flex w-80 shrink-0 border-l border-white/5 flex-col bg-panel p-5 gap-4">
          <Bar className="h-3 w-28" />
          <Bar className="h-20 w-full rounded-xl" />
          <Bar className="h-3 w-24 mt-2" />
          {[0, 1, 2].map((i) => (
            <Bar key={i} className="h-14 w-full rounded-lg" />
          ))}
        </aside>
      </div>

      <span className="sr-only" role="status">
        Loading your discovery session
      </span>
    </div>
  );
}
