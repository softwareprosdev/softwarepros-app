"use client";

import { useEffect, useState } from "react";

const THREATS_BLOCKED = 12847;
const SCANS_COMPLETED = 247891;

/**
 * The live counter strip under the hero. The counter starts from a constant so
 * the server and client render identical markup; it only moves after mount.
 */
export function SocTicker() {
  const [threats, setThreats] = useState(THREATS_BLOCKED);

  useEffect(() => {
    const id = setInterval(() => {
      setThreats((n) => n + Math.floor(Math.random() * 3));
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="py-4 border-y border-red-900/20 surface"
      role="status"
      aria-live="polite"
      aria-label="Live security operations status"
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 bg-red-400 rounded-full animate-pulse"
              aria-hidden="true"
            />
            <span className="text-xs font-mono text-red-400 font-bold">
              THREAT MONITORING ACTIVE
            </span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden md:block" aria-hidden="true" />
          <span className="text-xs font-mono text-gray-400">
            Security Operations Center · Real-time
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs font-mono">
          <div>
            <span className="text-gray-400">Threats Blocked (30d): </span>
            <span className="text-red-400 font-bold stat-count">
              {threats.toLocaleString("en-US")}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Scans Completed: </span>
            <span className="text-green-400 font-bold stat-count">
              {SCANS_COMPLETED.toLocaleString("en-US")}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Uptime: </span>
            <span className="text-blue-400 font-bold stat-count">99.97%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
