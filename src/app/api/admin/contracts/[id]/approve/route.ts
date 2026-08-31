import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthorized, unauthorizedResponse } from "@/lib/auth";
import { renderContractBody, hashContractBody } from "@/lib/contract";

/**
 * The human-review step: an architect approves (optionally adjusting) the
 * AI-drafted price and releases a PENDING_REVIEW contract to the client.
 * Nothing before this point is ever visible outside /admin — see the note
 * at the top of api/contracts/route.ts for why this gate exists at all.
 */

const Approve = z.object({
  totalCents: z.number().int().positive().optional(),
  depositCents: z.number().int().nonnegative().optional(),
});

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/contracts/[id]/approve">,
) {
  // Defence in depth: the proxy already guards /api/admin, but a matcher
  // change or a direct internal call must not bypass the check.
  if (!isAuthorized(request)) return unauthorizedResponse();

  const { id } = await context.params;
  const parsed = Approve.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract) {
    return Response.json({ error: "Contract not found." }, { status: 404 });
  }
  if (contract.status !== "PENDING_REVIEW") {
    return Response.json(
      { error: `Contract is already ${contract.status.toLowerCase()}.` },
      { status: 409 },
    );
  }

  const totalCents = parsed.data.totalCents ?? contract.totalCents;
  const depositCents = parsed.data.depositCents ?? contract.depositCents;
  if (depositCents > totalCents) {
    return Response.json(
      { error: "Deposit cannot exceed the total fee." },
      { status: 400 },
    );
  }

  // Re-render so the price the client actually sees always matches the
  // numbers stored on the row — an override that only touched the database
  // columns, leaving the prose contract text quoting the old figures, is
  // exactly the kind of inconsistency this template exists to prevent.
  const bodyText = renderContractBody({
    clientName: contract.clientName,
    clientEmail: contract.clientEmail,
    projectTitle: contract.projectTitle,
    scopeText: contract.scopeText,
    totalCents,
    depositCents,
    currency: contract.currency,
  });

  const updated = await prisma.contract.update({
    where: { id },
    data: {
      totalCents,
      depositCents,
      bodyText,
      bodyHash: hashContractBody(bodyText),
      status: "SENT",
      reviewedAt: new Date(),
      reviewedBy: process.env.ADMIN_USER || "admin",
    },
    select: { id: true, publicId: true, status: true },
  });

  return Response.json(
    { ok: true, contract: updated },
    { headers: { "Cache-Control": "no-store" } },
  );
}
