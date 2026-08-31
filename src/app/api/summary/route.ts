import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateSummary } from "@/lib/ai/analysis";
import { estimateProjectCost } from "@/lib/ai/estimate";
import { hasAnthropicCredentials } from "@/lib/ai/client";
import { publicId } from "@/lib/ids";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session-user";

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

  // The proxy already requires a signed-in user for this path; this is the
  // defence-in-depth check plus the actual ownership check the proxy can't
  // do on its own (see api/admin/leads/[id]/route.ts for the same pattern).
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const session = await prisma.discoverySession.findUnique({
    where: { publicId: parsed.data.sessionId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  // Reports "not found" rather than "forbidden" either way — a session that
  // exists but belongs to someone else must not be distinguishable from one
  // that doesn't exist at all.
  if (!session || session.userId !== user.id) {
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

    // Best-effort: a cost-draft failure must never block the summary itself.
    // The contract flow re-checks for a missing estimate and refuses to
    // proceed rather than silently defaulting to $0 — see api/contracts.
    let estimate: { lowCents: number; highCents: number; notes: string } | null = null;
    try {
      estimate = await estimateProjectCost(summary);
    } catch (error) {
      console.error("[summary] cost estimate failed", error);
    }

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
        estimatedLowCents: estimate?.lowCents,
        estimatedHighCents: estimate?.highCents,
        estimateNotes: estimate?.notes,
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
