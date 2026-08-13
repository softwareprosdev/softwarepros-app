"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import {
  SECURITY_PRINCIPLES,
  SOC_EVENT_POOL,
  type SocEvent,
} from "@/lib/security-content";

type Filter = "all" | SocEvent["type"];

type LogEntry = { id: number; event: SocEvent; time: string };

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "blocked", label: "Blocked" },
  { id: "warning", label: "Warnings" },
  { id: "ok", label: "OK" },
];

const stamp = () => new Date().toLocaleTimeString("en-US", { hour12: false });

export function SocDashboard() {
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [clock, setClock] = useState("");
  const [scanSeconds, setScanSeconds] = useState(0);
  const [score, setScore] = useState(94);
  const [detail, setDetail] = useState<SocEvent | null>(null);
  // Timestamps start empty and are filled in after mount: `new Date()` on the
  // server would never match what the browser renders.
  const [entries, setEntries] = useState<LogEntry[]>(() =>
    SOC_EVENT_POOL.map((event, i) => ({ id: i, event, time: "" })),
  );
  const nextId = useRef(SOC_EVENT_POOL.length);

  useEffect(() => {
    const tick = () => {
      const now = stamp();
      setClock(now);
      setEntries((prev) =>
        prev.some((e) => !e.time)
          ? prev.map((e) => (e.time ? e : { ...e, time: now }))
          : prev,
      );
    };
    // Deferred rather than run inline so the first paint still matches the
    // server HTML, which cannot know the browser's clock.
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setScanSeconds((s) => (s >= 45 ? 0 : s + 1));
    }, 1000);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      const event =
        SOC_EVENT_POOL[Math.floor(Math.random() * SOC_EVENT_POOL.length)];
      setEntries((prev) => [
        { id: nextId.current++, event, time: stamp() },
        ...prev.slice(0, 9),
      ]);
      if (Math.random() < 0.35) setScore(92 + Math.floor(Math.random() * 5));
    }, 4000);

    return () => clearInterval(id);
  }, [paused]);

  const visible = (
    filter === "all" ? entries : entries.filter((e) => e.event.type === filter)
  ).slice(0, 8);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Left: security philosophy */}
      <div className="space-y-5">
        {SECURITY_PRINCIPLES.map((principle) => (
          <div key={principle.title} className="flex items-start gap-4">
            <div
              className="w-9 h-9 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0 mt-0.5"
              aria-hidden="true"
            >
              <Icon name={principle.icon} className="text-red-400 text-xs" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{principle.title}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {principle.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Right: live SOC panel */}
      <div
        className="glass-red rounded-2xl p-6 relative overflow-hidden"
        role="region"
        aria-label="Live security operations center simulation"
      >
        <div className="scan-beam" aria-hidden="true" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 bg-red-400 rounded-full animate-pulse"
              aria-hidden="true"
            />
            <span className="text-xs font-mono text-red-400 font-bold">
              SECURITY POSTURE — LIVE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={
                paused ? "Resume live SOC updates" : "Pause live SOC updates"
              }
              className="px-3 py-1.5 text-xs border border-white/15 rounded-lg text-gray-300 hover:border-white/30 hover:text-white transition-all font-mono inline-flex items-center gap-1"
            >
              <Icon name={paused ? "play" : "pause"} />
              {paused ? "Resume" : "Pause"}
            </button>
            <span
              className="text-xs font-mono text-gray-500 stat-count"
              aria-label="Current time"
            >
              {clock || "--:--:--"}
            </span>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div
            className="bg-ink/70 rounded-xl p-4 border border-white/5"
            role="status"
            aria-label="Current threat level"
          >
            <p className="text-xs text-gray-400 mb-1 font-mono">THREAT LEVEL</p>
            <p className="text-2xl font-bold text-green-400 stat-count">LOW</p>
            <p className="text-xs text-gray-500 font-mono mt-1">0 active threats</p>
          </div>
          <div
            className="bg-ink/70 rounded-xl p-4 border border-white/5"
            role="status"
            aria-label="Open vulnerabilities"
          >
            <p className="text-xs text-gray-400 mb-1 font-mono">OPEN VULNS</p>
            <p className="text-2xl font-bold text-yellow-300 stat-count">3</p>
            <p className="text-xs text-gray-500 font-mono mt-1">2 medium · 1 low</p>
          </div>
          <div
            className="bg-ink/70 rounded-xl p-4 border border-white/5"
            role="status"
            aria-label="Last security scan time"
          >
            <p className="text-xs text-gray-400 mb-1 font-mono">LAST SCAN</p>
            <p className="text-lg font-bold text-white stat-count">
              {scanSeconds === 0 ? "Just now" : `${scanSeconds}s ago`}
            </p>
            <p className="text-xs text-green-400 font-mono mt-1">Continuous</p>
          </div>
          <div
            className="bg-ink/70 rounded-xl p-4 border border-white/5"
            role="status"
            aria-label="Security score"
          >
            <p className="text-xs text-gray-400 mb-1 font-mono">SECURITY SCORE</p>
            <p className="text-2xl font-bold text-blue-300 stat-count">
              {score}
              <span className="text-sm text-gray-500">/100</span>
            </p>
            <p className="text-xs text-gray-500 font-mono mt-1">Excellent</p>
          </div>
        </div>

        {/* Filters */}
        <div
          className="flex items-center gap-2 mb-3"
          role="group"
          aria-label="Filter security events by type"
        >
          <span className="text-xs text-gray-500 font-mono">Filter:</span>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`px-2.5 py-1 text-xs rounded-full border transition-all font-mono ${
                filter === f.id
                  ? "border-red-400/50 text-red-300"
                  : "border-white/15 text-gray-300 hover:border-white/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Live event log */}
        <div className="bg-ink/80 rounded-xl p-4 border border-white/5">
          <p className="text-xs text-gray-500 mb-3 font-mono uppercase tracking-wider">
            Live Event Log
          </p>
          <div
            className="font-mono text-xs max-h-44 overflow-y-auto"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label="Security events log"
          >
            {visible.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setDetail(entry.event)}
                className="event-row"
                aria-label={`${entry.event.type} event: ${entry.event.msg}. Show details.`}
              >
                <span
                  className={`${entry.event.color} shrink-0 w-4 text-center`}
                  aria-hidden="true"
                >
                  {entry.event.glyph}
                </span>
                <span className="text-gray-500 shrink-0 w-16 text-right">
                  {entry.time || "--:--:--"}
                </span>
                <span className="text-gray-300 truncate">{entry.event.msg}</span>
              </button>
            ))}
            {visible.length === 0 && (
              <p className="text-gray-500 py-2">No events match this filter.</p>
            )}
          </div>
        </div>

        {/* Event detail */}
        {detail && (
          <div
            className="mt-3 bg-ink/90 rounded-xl p-4 border border-red-500/20"
            role="region"
            aria-label="Event details"
            aria-live="polite"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-white font-mono">EVENT DETAIL</p>
              <button
                type="button"
                onClick={() => setDetail(null)}
                aria-label="Close event detail panel"
                className="text-gray-500 hover:text-white text-xs"
              >
                <Icon name="xmark" />
              </button>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{detail.detail}</p>
            <p className="text-xs text-gray-500 mt-2 font-mono">{detail.meta}</p>
          </div>
        )}
      </div>
    </div>
  );
}
