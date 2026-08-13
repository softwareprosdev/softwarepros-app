import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateSummary } from "@/lib/ai/analysis";
import { hasAnthropicCredentials } from "@/lib/ai/client";
import { publicId } from "@/lib/ids";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const maxDuration = 300;

const SummaryRequest = z.object({ sessionId: z.string().min(1) });

/** Snapshots a discovery session into a shareable project summary document. */
export async function POST(request: Request) {
  // Summary generation is the most expensive call in the app.
  const limit = rateLimit(clientKey(request, "summary"), {
    limit: 5,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return tooManyRequests(limit, "Too many summary requests. Try again shortly.");
  }

  const parsed = SummaryRequest.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!hasAnthropicCredentials()) {
    return Response.json(
      { error: "The AI Architect is not configured (ANTHROPIC_API_KEY)." },
      { status: 503 },
    );
  }

  const session = await prisma.discoverySession.findUnique({
    where: { publicId: parsed.data.sessionId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.messages.length < 2) {
    return Response.json(
      {
        error:
          "Tell the AI Architect a bit more about your project before generating a summary.",
      },
      { status: 400 },
    );
  }

  try {
    const summary = await generateSummary(
      session.messages.map((m) => ({ role: m.role, content: m.content })),
    );

    const created = await prisma.projectSummary.create({
      data: {
        publicId: publicId(),
        sessionId: session.id,
        title: summary.title,
        description: summary.description,
        industry: summary.industry,
        complexity: summary.complexity,
        phaseCount: summary.phases.length,
        nextStep: summary.nextStep,
        components: summary.components,
        requirements: summary.requirements,
        techStack: summary.techStack,
        phases: summary.phases,
        modules: summary.modules,
      },
      select: { publicId: true },
    });

    return Response.json({ publicId: created.publicId }, { status: 201 });
  } catch (error) {
    console.error("[summary] generation failed", error);
    return Response.json(
      { error: "Could not generate the summary. Please try again." },
      { status: 502 },
    );
  }
}
