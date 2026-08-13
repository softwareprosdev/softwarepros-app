"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { InputMode, RecentSession } from "@/components/discovery/types";

const MODES: { id: InputMode; icon: string; label: string }[] = [
  { id: "chat", icon: "comments", label: "AI Chat" },
  { id: "voice", icon: "microphone", label: "Voice Input" },
  { id: "upload", icon: "file-arrow-up", label: "Upload Docs" },
  { id: "image", icon: "image", label: "Upload Images" },
];

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.round(days / 7)} week${days < 14 ? "" : "s"} ago`;
}

export function DiscoverySidebar({
  mode,
  onModeChange,
  recentSessions,
  currentSessionId,
}: {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  recentSessions: RecentSession[];
  currentSessionId: string;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function newDiscovery() {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/sessions", { method: "POST" });
      const data = await res.json();
      router.push(`/discovery/${data.publicId}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/5 flex-col bg-panel">
      <div className="p-4">
        <button
          type="button"
          onClick={newDiscovery}
          disabled={creating}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Icon name={creating ? "spinner" : "plus"} spin={creating} className="text-xs" />
          New Discovery
        </button>
      </div>

      <div className="px-4 mb-4">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">
          Input Mode
        </p>
        <div className="space-y-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              aria-pressed={mode === m.id}
              className={`sidebar-tab w-full flex items-center gap-3 px-3 py-2.5 rounded-l-lg text-sm transition-all ${
                mode === m.id ? "active" : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon name={m.icon} className="w-4 text-center" />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mb-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">
          Recent Sessions
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {recentSessions.length === 0 && (
          <p className="px-3 text-xs text-gray-600">
            Your past discovery sessions will appear here.
          </p>
        )}
        {recentSessions.map((s) => {
          const active = s.publicId === currentSessionId;
          return (
            <Link
              key={s.publicId}
              href={`/discovery/${s.publicId}`}
              className={`block px-3 py-3 rounded-lg transition-colors ${
                active
                  ? "bg-white/5 border border-white/10"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <p
                className={`text-xs truncate ${active ? "font-semibold text-white" : "font-medium text-gray-300"}`}
              >
                {s.title}
              </p>
              <p className="text-xs text-gray-600 mt-0.5 truncate">
                {s.industry ? `${s.industry} · ` : ""}
                {relativeTime(s.updatedAt)}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <p className="text-xs text-gray-600 text-center">
          Sessions are private and encrypted.
          <br />
          Not stored beyond 30 days.
        </p>
      </div>
    </aside>
  );
}
