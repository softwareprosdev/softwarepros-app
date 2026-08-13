"use client";

import { Icon } from "@/components/Icon";
import { VoiceOrb } from "@/components/voice/VoiceOrb";
import {
  useVoiceConversation,
  type ConversationState,
} from "@/lib/use-voice-conversation";

/**
 * Spoken conversation with the AI Architect.
 *
 * Replaces the chat transcript while the workspace is in voice mode. The
 * turns still go through `/api/chat`, so anything said here lands in the same
 * session, updates the same live analysis, and feeds the same project
 * summary as a typed exchange.
 */

const STATUS: Record<ConversationState, { label: string; tone: string }> = {
  idle: { label: "Ready when you are", tone: "text-gray-500" },
  listening: { label: "Listening…", tone: "text-cyan-300" },
  thinking: { label: "Thinking…", tone: "text-indigo-300" },
  speaking: { label: "Speaking…", tone: "text-sky-300" },
};

export function VoiceConversation({
  sessionId,
  onSwitchToChat,
}: {
  sessionId: string;
  onSwitchToChat: () => void;
}) {
  const voice = useVoiceConversation(sessionId);
  const status = STATUS[voice.state];
  const active = voice.state !== "idle";
  const lastReply = [...voice.turns].reverse().find((t) => t.role === "assistant");

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 overflow-y-auto">
      <VoiceOrb state={voice.state} readLevel={voice.readLevel} size={280} />

      {/* The orb is decorative and aria-hidden, so state is announced here. */}
      <p
        aria-live="polite"
        className={`mt-6 text-sm font-semibold tracking-widest uppercase ${status.tone}`}
      >
        {status.label}
      </p>

      <div className="mt-6 max-w-xl w-full text-center min-h-24">
        {voice.interim && (
          <p className="text-lg text-white leading-relaxed">
            {voice.interim}
            <span className="inline-block w-0.5 h-5 bg-cyan-400 rounded ml-1 align-middle animate-blink" />
          </p>
        )}

        {!voice.interim && lastReply && (
          <p className="text-base text-gray-300 leading-relaxed">
            {lastReply.text}
          </p>
        )}

        {!voice.interim && !lastReply && !voice.error && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {active
              ? "Describe the business problem you're trying to solve. The architect will ask follow-up questions."
              : "Start the conversation and describe your project out loud. Everything you say is captured in this session."}
          </p>
        )}
      </div>

      {voice.error && (
        <div
          role="alert"
          className="mt-4 max-w-xl rounded-xl border border-amber-500/20 bg-amber-950/40 px-4 py-3 text-xs text-amber-300 text-center leading-relaxed"
        >
          {voice.error}
        </div>
      )}

      {/* Only surfaced once a reply has actually arrived silently — saying it
          up front would advertise a missing key to every visitor. */}
      {!voice.voiceAvailable && voice.turns.length > 0 && (
        <p className="mt-4 text-xs text-gray-600">
          Spoken replies are unavailable, so the architect is answering in text.
        </p>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => (active ? voice.stop() : void voice.start())}
          className={`px-8 py-3.5 rounded-full text-sm font-semibold transition-all ${
            active
              ? "border border-white/15 text-gray-300 hover:text-white hover:border-white/30"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90"
          }`}
        >
          <Icon name={active ? "pause" : "microphone"} className="mr-2" />
          {active ? "End voice session" : "Start talking"}
        </button>

        <button
          type="button"
          onClick={() => {
            voice.stop();
            onSwitchToChat();
          }}
          className="px-8 py-3.5 rounded-full border border-white/10 text-sm font-semibold text-gray-400 hover:text-white hover:border-white/20 transition-all"
        >
          <Icon name="keyboard" className="mr-2" />
          Switch to typing
        </button>
      </div>

      <p className="mt-6 text-xs text-gray-700 max-w-md text-center leading-relaxed">
        Everything said here is recorded in this discovery session and reviewed
        by a Senior Software Architect before it becomes a commitment.
      </p>
    </div>
  );
}
