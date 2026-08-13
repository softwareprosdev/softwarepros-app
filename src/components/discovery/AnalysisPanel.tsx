"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { SessionAnalysis } from "@/components/discovery/types";

function Meter({
  label,
  value,
  display,
  gradient,
  valueClass,
}: {
  label: string;
  value: number;
  display: string;
  gradient: string;
  valueClass: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-400">{label}</span>
        <span className={`font-semibold ${valueClass}`}>{display}</span>
      </div>
      <div
        className="h-1.5 bg-white/5 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${gradient}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function AnalysisPanel({
  analysis,
  onGenerateSummary,
  generating,
  existingSummaryId,
  canGenerate,
}: {
  analysis: SessionAnalysis;
  onGenerateSummary: () => void;
  generating: boolean;
  existingSummaryId: string | null;
  canGenerate: boolean;
}) {
  const reqPct =
    analysis.requirementsTarget > 0
      ? (analysis.requirementsFound / analysis.requirementsTarget) * 100
      : 0;

  const detected: { label: string; value: string | null; className: string }[] = [
    { label: "Industry", value: analysis.industry, className: "text-amber-400" },
    { label: "Scale", value: analysis.scale, className: "text-white" },
    { label: "Complexity", value: analysis.complexity, className: "text-orange-400" },
    { label: "Current State", value: analysis.currentState, className: "text-red-300" },
  ];

  const hasDetection = detected.some((d) => d.value);

  return (
    <aside className="hidden xl:flex w-80 shrink-0 border-l border-white/5 flex-col bg-panel overflow-y-auto">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold">Live Analysis</h2>
          <span className="ai-badge">AI-Generated</span>
        </div>
        <p className="text-xs text-gray-500">
          Updates as you describe your project
        </p>
      </div>

      <div className="p-5 border-b border-white/5 space-y-4">
        <Meter
          label="Project Clarity"
          value={analysis.clarityScore}
          display={`${analysis.clarityScore}%`}
          gradient="bg-gradient-to-r from-blue-600 to-cyan-500"
          valueClass="text-blue-400"
        />
        <Meter
          label="Requirements Identified"
          value={reqPct}
          display={`${analysis.requirementsFound} / est. ${analysis.requirementsTarget}`}
          gradient="bg-gradient-to-r from-green-600 to-emerald-500"
          valueClass="text-green-400"
        />
      </div>

      <div className="p-5 border-b border-white/5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Detected Context
        </h3>
        {hasDetection ? (
          <dl className="space-y-2">
            {detected.map((row) =>
              row.value ? (
                <div key={row.label} className="flex justify-between items-center gap-3">
                  <dt className="text-xs text-gray-400 shrink-0">{row.label}</dt>
                  <dd className={`text-xs font-semibold text-right ${row.className}`}>
                    {row.value}
                  </dd>
                </div>
              ) : null,
            )}
          </dl>
        ) : (
          <p className="text-xs text-gray-600">
            Describe your business and the AI Architect will start filling this
            in.
          </p>
        )}
      </div>

      <div className="p-5 border-b border-white/5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Modules Identified
        </h3>
        {analysis.modules.length === 0 && analysis.unclearModules.length === 0 ? (
          <p className="text-xs text-gray-600">Nothing identified yet.</p>
        ) : (
          <ul className="space-y-2">
            {analysis.modules.map((m) => (
              <li key={m} className="flex items-center gap-2 text-xs">
                <Icon name="circle-check" className="text-green-400 w-3" />
                <span className="text-gray-200">{m}</span>
              </li>
            ))}
            {analysis.unclearModules.map((m) => (
              <li key={m} className="flex items-center gap-2 text-xs text-gray-500">
                <Icon name="circle-question" className="text-gray-600 w-3" />
                <span>{m} (unclear)</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {analysis.recommendedPlatform && (
        <div className="p-5 border-b border-white/5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Recommended Platform
          </h3>
          <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-3">
            <p className="text-sm font-bold text-white mb-1">
              {analysis.recommendedPlatform}
            </p>
            <p className="text-xs text-gray-400">
              Custom-engineered · 5-phase delivery
            </p>
          </div>
        </div>
      )}

      {analysis.clarifications.length > 0 && (
        <div className="p-5 border-b border-white/5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Needs Clarification
          </h3>
          <ul className="space-y-2">
            {analysis.clarifications.map((c) => (
              <li key={c} className="flex items-start gap-2 text-xs">
                <Icon
                  name="triangle-exclamation"
                  className="text-amber-400 w-3 mt-0.5 shrink-0"
                />
                <span className="text-gray-400">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-5 mt-auto space-y-2">
        {existingSummaryId && (
          <Link
            href={`/summary/${existingSummaryId}`}
            className="block w-full py-2.5 text-center border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white transition-colors"
          >
            View Latest Summary
          </Link>
        )}
        <button
          type="button"
          onClick={onGenerateSummary}
          disabled={generating || !canGenerate}
          title={
            canGenerate
              ? undefined
              : "Describe your project first — the summary needs something to work from."
          }
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating && <Icon name="spinner" spin />}
          {generating ? "Generating…" : "Generate Project Summary"}
        </button>
        <Link
          href="/contact?intent=schedule"
          className="block w-full py-2.5 text-center border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white transition-colors"
        >
          Speak With An Architect
        </Link>
      </div>
    </aside>
  );
}
