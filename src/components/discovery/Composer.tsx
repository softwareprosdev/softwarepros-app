"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { requestMicrophone } from "@/lib/microphone";
import type { AttachmentSummary, InputMode } from "@/components/discovery/types";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Composer({
  sessionId,
  attachments,
  onAttachmentsChange,
  onSend,
  disabled,
  mode,
  onError,
}: {
  sessionId: string;
  attachments: AttachmentSummary[];
  onAttachmentsChange: (next: AttachmentSummary[]) => void;
  onSend: (text: string, attachmentIds: string[]) => void;
  disabled: boolean;
  mode: InputMode;
  onError: (message: string | null) => void;
}) {
  const [value, setValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dictating, setDictating] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  function submit() {
    if (!value.trim() || disabled) return;
    onSend(value, attachments.map((a) => a.id));
    setValue("");
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    onError(null);
    const uploaded: AttachmentSummary[] = [];
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("sessionId", sessionId);
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        uploaded.push(data.attachment);
      }
      onAttachmentsChange([...attachments, ...uploaded]);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function toggleDictation() {
    if (dictating) {
      recognitionRef.current?.stop();
      return;
    }
    onError(null);

    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      onError(
        "This browser doesn't support in-browser dictation. Type your message instead.",
      );
      return;
    }

    // Ask for the microphone explicitly before starting recognition. Chrome
    // prompts on its own, but when the answer is no it fails through
    // `onerror` with nothing shown — the button just stopped working. Asking
    // here means a denial produces a message that says why and what to do.
    const mic = await requestMicrophone();
    if (!mic.ok) {
      onError(mic.message);
      return;
    }
    // Recognition opens its own capture; this handle was only for permission.
    mic.stream.getTracks().forEach((track) => track.stop());

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          setValue((v) => `${v}${v ? " " : ""}${result[0].transcript.trim()}`);
        }
      }
    };
    recognition.onerror = (event) => {
      setDictating(false);
      // "no-speech" and "aborted" are normal ends to a dictation turn, not
      // failures worth interrupting the visitor over.
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        onError(
          "Microphone access is blocked for this site. Click the lock icon in your browser's address bar, allow the microphone, then try again.",
        );
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        onError(`Dictation stopped: ${event.error}. Type your message instead.`);
      }
    };
    recognition.onend = () => setDictating(false);
    recognition.start();
    recognitionRef.current = recognition;
    setDictating(true);
  }

  return (
    <div className="p-4 border-t border-white/5 bg-panel shrink-0">
      {attachments.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-3">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300"
            >
              <Icon
                name={a.kind === "IMAGE" ? "image" : "file-pdf"}
                className={a.kind === "IMAGE" ? "text-green-400" : "text-red-400"}
              />
              <span className="max-w-40 truncate">{a.filename}</span>
              <span className="text-gray-600">{formatBytes(a.sizeBytes)}</span>
              <button
                type="button"
                onClick={() =>
                  onAttachmentsChange(attachments.filter((x) => x.id !== a.id))
                }
                aria-label={`Remove ${a.filename}`}
                className="text-gray-600 hover:text-white ml-1"
              >
                <Icon name="xmark" className="text-xs" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="input-area rounded-2xl p-4 transition-all">
        <label htmlFor="composer" className="sr-only">
          Describe your project
        </label>
        <textarea
          id="composer"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          disabled={disabled}
          placeholder={
            mode === "upload"
              ? "Attach your specs or brief, then tell me what to look for…"
              : "Describe your project, business problem, or technology need…"
          }
          className="w-full bg-transparent text-sm text-white placeholder-gray-600 resize-none focus:outline-none leading-relaxed disabled:opacity-60"
        />

        <div className="flex items-center justify-between pt-3 border-t border-white/5 gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void toggleDictation()}
              aria-pressed={dictating}
              title="Voice input"
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                dictating
                  ? "border-cyan-500/60 text-cyan-400 bg-cyan-500/10"
                  : "border-white/10 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/40"
              }`}
            >
              <Icon name="microphone" className="text-xs" />
            </button>

            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              title="Upload document"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/40 transition-all"
            >
              <Icon name={uploading ? "spinner" : "paperclip"} spin={uploading} className="text-xs" />
            </button>

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              title="Upload image"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-500/40 transition-all"
            >
              <Icon name="image" className="text-xs" />
            </button>

            <span className="text-xs text-gray-600 hidden md:block">
              Voice · Docs · Images supported
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 font-mono hidden sm:block">
              ↵ to send
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={disabled || !value.trim()}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-xs font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send <Icon name="arrow-up" className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      <input
        ref={docInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.md,.csv,.json,.yaml,.yml,.log,.tsv,application/pdf,text/plain"
        className="hidden"
        onChange={(e) => {
          void upload(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          void upload(e.target.files);
          e.target.value = "";
        }}
      />

      <p className="text-center text-xs text-gray-700 mt-3">
        AI-generated recommendations require engineering review · Not a
        guaranteed quote
      </p>
    </div>
  );
}
