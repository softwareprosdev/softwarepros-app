import { z } from "zod";
import type { Content, Part } from "@google/genai";
import { gemini, MODEL, hasGeminiCredentials } from "@/lib/ai/client";
import { ARCHITECT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { extractAnalysis } from "@/lib/ai/analysis";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session-user";

export const maxDuration = 120;

const ChatRequest = z.object({
  sessionId: z.string().min(1),
  message: z.string().trim().min(1).max(20_000).optional(),
  attachmentIds: z.array(z.string()).max(10).optional(),
  /**
   * Answer the session's existing trailing client message instead of adding a
   * new one. Used when a session arrives pre-seeded (e.g. from the voice modal)
   * so the opening message isn't persisted twice.
   */
  resume: z.boolean().optional(),
});

type StreamEvent =
  | { type: "text"; text: string }
  | { type: "analysis"; analysis: unknown }
  | { type: "done"; messageId: string }
  | { type: "error"; error: string };

function encodeEvent(event: StreamEvent) {
  // Newline-delimited JSON: trivially parseable from the client without an
  // SSE library, and each event is self-contained.
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

/**
 * Gemini finish reasons that mean the model declined to answer (safety
 * filters, blocked terms, and the like) rather than simply running out of
 * room (MAX_TOKENS) or finishing normally (STOP).
 */
const REFUSAL_FINISH_REASONS = new Set([
  "SAFETY",
  "RECITATION",
  "LANGUAGE",
  "OTHER",
  "BLOCKLIST",
  "PROHIBITED_CONTENT",
  "SPII",
]);

export async function POST(request: Request) {
  // Every call here spends model tokens, so it's rate limited before anything else.
  const limit = rateLimit(clientKey(request, "chat"), {
    limit: 20,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return tooManyRequests(
      limit,
      "You're sending messages faster than the architect can answer. Give it a moment.",
    );
  }

  const parsed = ChatRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!hasGeminiCredentials()) {
    return Response.json(
      {
        error:
          "The AI Architect is not configured. Set GEMINI_API_KEY in your environment.",
      },
      { status: 503 },
    );
  }

  // Defence in depth — the proxy already requires a signed-in user here.
  // Without this check (and the ownership comparison below), any signed-in
  // client could POST into any other client's session just by knowing its
  // publicId, which is exactly the leak this whole feature exists to close.
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const { sessionId, attachmentIds, resume } = parsed.data;

  const session = await prisma.discoverySession.findUnique({
    where: { publicId: sessionId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  // "Not found" either way — a session that exists but belongs to someone
  // else must not be distinguishable from one that doesn't exist.
  if (!session || session.userId !== user.id) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  // In resume mode the client message already exists; otherwise persist it.
  const trailing = session.messages.at(-1);
  let message: string;
  let priorMessages = session.messages;

  if (resume) {
    if (!trailing || trailing.role !== "USER") {
      return Response.json(
        { error: "Nothing to resume — the last turn was not a client message." },
        { status: 409 },
      );
    }
    message = trailing.content;
    priorMessages = session.messages.slice(0, -1);
  } else {
    if (!parsed.data.message) {
      return Response.json({ error: "A message is required." }, { status: 400 });
    }
    message = parsed.data.message;
  }

  const attachments = attachmentIds?.length
    ? await prisma.attachment.findMany({
        where: { id: { in: attachmentIds }, sessionId: session.id },
      })
    : [];

  if (!resume) {
    const userMessage = await prisma.message.create({
      data: { sessionId: session.id, role: "USER", content: message },
    });
    if (attachments.length) {
      await prisma.attachment.updateMany({
        where: { id: { in: attachments.map((a) => a.id) } },
        data: { messageId: userMessage.id },
      });
    }
  }

  // Prior turns as Gemini history — "model", not "assistant", is the role
  // Gemini expects for the AI's own turns.
  const history: Content[] = priorMessages.map((m) => ({
    role: m.role === "USER" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const currentParts: Part[] = [];
  for (const attachment of attachments) {
    if (attachment.kind === "IMAGE" || attachment.mimeType === "application/pdf") {
      // Gemini reads both images and PDFs natively from inline base64 data —
      // no client-side text extraction needed either way.
      currentParts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.content,
        },
      });
    } else {
      currentParts.push({
        text: `<document filename="${attachment.filename}">\n${attachment.content}\n</document>`,
      });
    }
  }
  currentParts.push({ text: message });

  const contents: Content[] = [...history, { role: "user", parts: currentParts }];

  const stream = new ReadableStream({
    async start(controller) {
      let full = "";
      let finishReason: string | undefined;
      try {
        const aiStream = await gemini.models.generateContentStream({
          model: MODEL,
          contents,
          config: {
            systemInstruction: ARCHITECT_SYSTEM_PROMPT,
            maxOutputTokens: 4096,
          },
        });

        for await (const chunk of aiStream) {
          const text = chunk.text;
          if (text) {
            full += text;
            controller.enqueue(encodeEvent({ type: "text", text }));
          }
          const reason = chunk.candidates?.[0]?.finishReason;
          if (reason) finishReason = reason;
        }

        if (!full && finishReason && REFUSAL_FINISH_REASONS.has(finishReason)) {
          const notice =
            "I can't help with that request. If you think this is a mistake, describe the business problem instead and I'll pick it up from there.";
          controller.enqueue(encodeEvent({ type: "text", text: notice }));
          full = notice;
        }

        const assistantMessage = await prisma.message.create({
          data: {
            sessionId: session.id,
            role: "ASSISTANT",
            content: full,
          },
        });

        // Refresh the live-analysis panel from the full conversation.
        const turns = [
          ...priorMessages.map((m) => ({ role: m.role, content: m.content })),
          { role: "USER", content: message },
          { role: "ASSISTANT", content: full },
        ];
        const analysis = await extractAnalysis(turns);

        if (analysis) {
          await prisma.discoverySession.update({
            where: { id: session.id },
            data: {
              title: analysis.title || session.title,
              industry: analysis.industry || null,
              scale: analysis.scale || null,
              complexity: analysis.complexity || null,
              currentState: analysis.currentState || null,
              clarityScore: clamp(analysis.clarityScore, 0, 100),
              requirementsFound: Math.max(0, analysis.requirementsFound),
              requirementsTarget: Math.max(1, analysis.requirementsTarget),
              recommendedPlatform: analysis.recommendedPlatform || null,
              modules: analysis.modules,
              unclearModules: analysis.unclearModules,
              clarifications: analysis.clarifications,
              suggestions: analysis.suggestions,
            },
          });
          controller.enqueue(encodeEvent({ type: "analysis", analysis }));
        }

        controller.enqueue(
          encodeEvent({ type: "done", messageId: assistantMessage.id }),
        );
      } catch (error) {
        console.error("[chat] stream failed", error);
        controller.enqueue(
          encodeEvent({
            type: "error",
            error:
              "The AI Architect hit an error mid-response. Your message was saved — try again.",
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}
