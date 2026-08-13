"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Wordmark } from "@/components/SiteNav";
import { DiscoverySidebar } from "@/components/discovery/DiscoverySidebar";
import { AnalysisPanel } from "@/components/discovery/AnalysisPanel";
import { MessageList } from "@/components/discovery/MessageList";
import { Composer } from "@/components/discovery/Composer";
import { VoiceConversation } from "@/components/voice/VoiceConversation";
import type {
  AttachmentSummary,
  ChatMessage,
  InputMode,
  RecentSession,
  SessionAnalysis,
} from "@/components/discovery/types";

export function DiscoveryWorkspace({
  sessionId,
  title,
  initialMessages,
  initialAnalysis,
  initialAttachments,
  recentSessions,
  existingSummaryId,
  initialMode,
}: {
  sessionId: string;
  title: string;
  initialMessages: ChatMessage[];
  initialAnalysis: SessionAnalysis;
  initialAttachments: AttachmentSummary[];
  recentSessions: RecentSession[];
  existingSummaryId: string | null;
  initialMode: InputMode;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [analysis, setAnalysis] = useState<SessionAnalysis>(initialAnalysis);
  const [attachments, setAttachments] =
    useState<AttachmentSummary[]>(initialAttachments);
  const [mode, setMode] = useState<InputMode>(initialMode);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentFirstRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const send = useCallback(
    async (
      text: string,
      attachmentIds: string[] = [],
      { resume = false }: { resume?: boolean } = {},
    ) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      setError(null);
      setStreaming(true);

      const assistantId = `assistant-${Date.now()}`;
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: "ASSISTANT",
        content: "",
        createdAt: new Date().toISOString(),
        pending: true,
      };

      // On resume the client bubble is already on screen (and in the database),
      // so only the assistant placeholder is appended.
      setMessages((prev) =>
        resume
          ? [...prev, assistantPlaceholder]
          : [
              ...prev,
              {
                id: `local-${Date.now()}`,
                role: "USER",
                content: trimmed,
                createdAt: new Date().toISOString(),
              },
              assistantPlaceholder,
            ],
      );
      setAttachments([]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            resume
              ? { sessionId, resume: true }
              : { sessionId, message: trimmed, attachmentIds },
          ),
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "The AI Architect is unavailable.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // The stream is newline-delimited JSON; a chunk may split an event, so
        // keep the trailing partial line in the buffer until the next read.
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            let event: {
              type: string;
              text?: string;
              analysis?: SessionAnalysis;
              error?: string;
            };
            try {
              event = JSON.parse(line);
            } catch {
              continue;
            }

            if (event.type === "text" && event.text) {
              const chunk = event.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + chunk }
                    : m,
                ),
              );
            } else if (event.type === "analysis" && event.analysis) {
              setAnalysis((prev) => ({ ...prev, ...event.analysis! }));
            } else if (event.type === "error") {
              setError(event.error ?? "Something went wrong.");
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, pending: false } : m)),
        );
        router.refresh();
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        setError(
          err instanceof Error ? err.message : "The AI Architect is unavailable.",
        );
      } finally {
        setStreaming(false);
      }
    },
    [sessionId, streaming, router],
  );

  // A session opened from the voice modal already has the client's first
  // message but no reply — answer it once on mount. Deferred a tick so the
  // state updates inside `send` don't cascade out of the effect body.
  useEffect(() => {
    if (sentFirstRef.current) return;
    const last = initialMessages.at(-1);
    if (initialMessages.length !== 1 || last?.role !== "USER") return;
    sentFirstRef.current = true;
    const id = setTimeout(() => void send(last.content, [], { resume: true }), 0);
    return () => clearTimeout(id);
  }, [initialMessages, send]);

  async function generateSummary() {
    if (generating) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate summary");
      router.push(`/summary/${data.publicId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate summary");
      setGenerating(false);
    }
  }

  const hasConversation = messages.length > 0;

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <nav className="h-14 shrink-0 w-full flex justify-between items-center px-6 border-b border-white/5 bg-ink/90 backdrop-blur-md z-50 relative">
        <div className="flex items-center gap-6 min-w-0">
          <Wordmark className="text-lg" />
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <span className="text-sm text-gray-400 font-medium hidden sm:block">
            AI Discovery Center
          </span>
          <span className="ai-badge hidden md:inline">
            Virtual Software Architect
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            AI Architect Online
          </div>
          <Link
            href="/contact?intent=schedule"
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-xs font-semibold"
          >
            Start A Project
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 min-h-0">
        <DiscoverySidebar
          mode={mode}
          onModeChange={setMode}
          recentSessions={recentSessions}
          currentSessionId={sessionId}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-12 shrink-0 flex items-center px-6 border-b border-white/5 bg-ink/50">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                <Icon name="brain" className="text-xs text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  SoftwarePros AI Architect
                </p>
                <p className="text-xs text-green-400 truncate">
                  {streaming
                    ? "Thinking…"
                    : analysis.industry
                      ? `Online · Analyzing ${analysis.industry}`
                      : `Online · ${title}`}
                </p>
              </div>
            </div>
          </div>

          {/* Voice mode replaces the transcript rather than sitting beside it:
              the orb needs the room, and the turns still land in this same
              session, so nothing is lost by hiding the list while talking. */}
          {mode === "voice" ? (
            <VoiceConversation
              sessionId={sessionId}
              onSwitchToChat={() => {
                setMode("chat");
                router.refresh();
              }}
            />
          ) : (
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6">
              <MessageList
                messages={messages}
                suggestions={analysis.suggestions}
                onSuggestion={(s) => void send(s)}
                streaming={streaming}
                showWelcome={!hasConversation}
              />
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mx-4 md:mx-6 mb-2 rounded-lg border border-red-500/25 bg-red-950/40 px-4 py-2.5 text-xs text-red-300"
            >
              {error}
            </div>
          )}

          {mode !== "voice" && (
            <Composer
              sessionId={sessionId}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              onSend={send}
              disabled={streaming}
              mode={mode}
              onError={setError}
            />
          )}
        </div>

        <AnalysisPanel
          analysis={analysis}
          onGenerateSummary={generateSummary}
          generating={generating}
          existingSummaryId={existingSummaryId}
          canGenerate={messages.length >= 2}
        />
      </div>
    </div>
  );
}
