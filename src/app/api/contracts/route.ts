import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { publicId } from "@/lib/ids";
import { getCurrentUser } from "@/lib/session-user";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { renderContractBody, hashContractBody } from "@/lib/contract";
import { estimateProjectCost } from "@/lib/ai/estimate";
import type { Summary } from "@/lib/ai/schemas";

/**
 * Drafts a contract from a project summary — priced from the AI's cost
 * estimate, but never sent to a client until a human architect reviews and
 * releases it (see api/admin/contracts/[id]/approve). This is deliberate:
 * the existing AI Architect prompts (lib/ai/prompts.ts) are written to never
 * quote a price precisely because an unreviewed AI number becoming a signed,
 * paid, binding commitment is a real business and legal risk, not a
 * hypothetical one. This endpoint is the one place that gets a price
 * attached to real money — it stays gated behind PENDING_REVIEW on purpose.
 */

const CreateContract = z.object({ summaryId: z.string().min(1) });

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "contracts"), {
    limit: 10,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return tooManyRequests(limit, "Too many contract requests. Try again shortly.");
  }

  const parsed = CreateContract.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const summary = await prisma.projectSummary.findUnique({
    where: { publicId: parsed.data.summaryId },
    include: { session: true },
  });
  if (!summary || summary.session.userId !== user.id) {
    return Response.json({ error: "Summary not found" }, { status: 404 });
  }

  let lowCents = summary.estimatedLowCents;
  let highCents = summary.estimatedHighCents;

  // The estimate is normally drafted alongside the summary (api/summary).
  // If that earlier call failed, retry once here rather than blocking the
  // client on a transient AI error from a step they already completed.
  if (lowCents == null || highCents == null) {
    try {
      const reconstructed = {
        title: summary.title,
        description: summary.description,
        industry: summary.industry,
        complexity: summary.complexity,
        nextStep: summary.nextStep,
        components: summary.components,
        requirements: summary.requirements,
        techStack: summary.techStack,
        phases: summary.phases,
        modules: summary.modules,
      } as unknown as Summary;
      const estimate = await estimateProjectCost(reconstructed);
      lowCents = estimate.lowCents;
      highCents = estimate.highCents;
      await prisma.projectSummary.update({
        where: { id: summary.id },
        data: {
          estimatedLowCents: lowCents,
          estimatedHighCents: highCents,
          estimateNotes: estimate.notes,
        },
      });
    } catch (error) {
      console.error("[contracts] estimate retry failed", error);
      return Response.json(
        {
          error:
            "Could not draft a cost estimate for this project. Try again shortly.",
        },
        { status: 502 },
      );
    }
  }

  const totalCents = roundToWholeDollar((lowCents + highCents) / 2);
  const depositCents = roundToWholeDollar(totalCents / 2);

  const clientName = user.name ?? user.email ?? "Client";
  const clientEmail = user.email ?? "";
  const scopeText = buildScopeText(summary);
  const bodyText = renderContractBody({
    clientName,
    clientEmail,
    projectTitle: summary.title,
    scopeText,
    totalCents,
    depositCents,
    currency: "usd",
  });

  const created = await prisma.contract.create({
    data: {
      publicId: publicId(),
      userId: user.id,
      sessionId: summary.sessionId,
      summaryId: summary.id,
      clientName,
      clientEmail,
      projectTitle: summary.title,
      scopeText,
      bodyText,
      bodyHash: hashContractBody(bodyText),
      totalCents,
      depositCents,
      status: "PENDING_REVIEW",
    },
    select: { publicId: true },
  });

  return Response.json({ publicId: created.publicId }, { status: 201 });
}

function roundToWholeDollar(cents: number): number {
  return Math.max(0, Math.round(cents / 100) * 100);
}

function buildScopeText(summary: {
  description: string;
  modules: unknown;
  requirements: unknown;
}): string {
  const modules = Array.isArray(summary.modules)
    ? summary.modules.filter((m): m is string => typeof m === "string")
    : [];

  const requirementLines: string[] = [];
  if (
    typeof summary.requirements === "object" &&
    summary.requirements !== null &&
    !Array.isArray(summary.requirements)
  ) {
    const groups = summary.requirements as Record<string, unknown>;
    for (const key of ["functional", "nonFunctional", "aiOpportunities"]) {
      const items = groups[key];
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        if (
          typeof item === "object" &&
          item !== null &&
          "text" in item &&
          typeof (item as { text: unknown }).text === "string"
        ) {
          requirementLines.push(`- ${(item as { text: string }).text}`);
        }
      }
    }
  }

  const parts = [summary.description];
  if (modules.length) parts.push(`Modules: ${modules.join(", ")}.`);
  if (requirementLines.length) {
    parts.push(`Key requirements:\n${requirementLines.join("\n")}`);
  }
  return parts.join("\n\n");
}
