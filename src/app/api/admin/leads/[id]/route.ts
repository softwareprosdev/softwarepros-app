import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthorized, unauthorizedResponse } from "@/lib/auth";
import type { LeadStatus } from "@/generated/prisma/enums";

// `satisfies` couples this tuple to the Prisma enum at compile time without
// pulling the client into the request path.
const STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "ARCHIVED",
] as const satisfies readonly LeadStatus[];

const StatusUpdate = z.object({ status: z.enum(STATUSES) });

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/leads/[id]">,
) {
  // Defence in depth: the proxy already guards /api/admin, but a matcher
  // change or a direct internal call must not bypass the check.
  if (!isAuthorized(request)) return unauthorizedResponse();

  const { id } = await context.params;
  const parsed = StatusUpdate.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  const existing = await prisma.lead.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return Response.json({ error: "Lead not found." }, { status: 404 });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: { status: parsed.data.status },
    select: { id: true, status: true },
  });

  return Response.json({ ok: true, lead }, { headers: { "Cache-Control": "no-store" } });
}
