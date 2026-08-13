"use client";

import { Icon } from "@/components/Icon";
import {
  DEFAULT_SUGGESTIONS,
  type ChatMessage,
} from "@/components/discovery/types";

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Renders assistant text with paragraph breaks and simple **bold** spans. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => (
        <p
          key={i}
          className={`text-sm text-gray-100 leading-relaxed ${i > 0 ? "mt-3" : ""}`}
        >
          {para.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j} className="text-white font-semibold">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            ),
          )}
        </p>
      ))}
    </>
  );
}

function ArchitectAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
      <Icon name="brain" className="text-xs" />
    </div>
  );
}

export function MessageList({
  messages,
  suggestions,
  onSuggestion,
  streaming,
  showWelcome,
}: {
  messages: ChatMessage[];
  suggestions: string[];
  onSuggestion: (s: string) => void;
  streaming: boolean;
  showWelcome: boolean;
}) {
  const chips = suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS;
  const lastIsPendingEmpty =
    streaming && messages.at(-1)?.role === "ASSISTANT" && !messages.at(-1)?.content;

  return (
    <div className="space-y-6 max-w-4xl">
      {showWelcome && (
        <>
          <div className="flex gap-3 max-w-3xl">
            <ArchitectAvatar />
            <div className="flex-1">
              <div className="msg-ai p-4 mb-1 inline-block max-w-full">
                <p className="text-sm text-gray-100 leading-relaxed">
                  Hello. I&apos;m the SoftwarePros AI Architect.
                </p>
                <p className="text-sm text-gray-100 leading-relaxed mt-2">
                  Tell me about your business and what you&apos;re trying to
                  accomplish. You don&apos;t need to know the technology — just
                  describe the problem you&apos;re solving.
                </p>
                <p className="text-sm text-gray-300 leading-relaxed mt-2">
                  For example:{" "}
                  <span className="text-blue-300 italic">
                    &ldquo;We run a trucking company and manage everything in
                    spreadsheets. I need a better way.&rdquo;
                  </span>
                </p>
              </div>
              <p className="text-xs text-gray-600 ml-1">Just now</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 ml-11">
            {DEFAULT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSuggestion(s)}
                className="px-4 py-2 text-xs border border-white/10 rounded-full text-gray-300 hover:border-blue-500/40 hover:text-white transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {messages.map((message) =>
        message.role === "USER" ? (
          <div
            key={message.id}
            className="flex gap-3 max-w-3xl ml-auto flex-row-reverse"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="user" className="text-xs text-gray-300" />
            </div>
            <div className="flex-1 flex flex-col items-end">
              <div className="msg-user p-4 mb-1 inline-block max-w-lg">
                <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              <p className="text-xs text-gray-600 mr-1">
                {timeOf(message.createdAt)}
              </p>
            </div>
          </div>
        ) : message.content ? (
          <div key={message.id} className="flex gap-3 max-w-4xl">
            <ArchitectAvatar />
            <div className="flex-1 min-w-0">
              <div className="msg-ai p-4 mb-1">
                <RichText text={message.content} />
              </div>
              <p className="text-xs text-gray-600 ml-1">
                {timeOf(message.createdAt)}
              </p>
            </div>
          </div>
        ) : null,
      )}

      {lastIsPendingEmpty && (
        <div className="flex gap-3 max-w-3xl">
          <ArchitectAvatar />
          <div className="msg-ai px-5 py-4 inline-flex items-center gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              {[0, 0.15, 0.3].map((d) => (
                <div
                  key={d}
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${d}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 italic">
              Understanding your requirements…
            </span>
          </div>
        </div>
      )}

      {!showWelcome && !streaming && messages.at(-1)?.role === "ASSISTANT" && (
        <div className="flex flex-wrap gap-2 ml-11">
          {chips.slice(0, 5).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestion(s)}
              className="px-3 py-1.5 text-xs border border-white/10 rounded-full text-gray-300 hover:border-blue-500/40 hover:text-white transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
