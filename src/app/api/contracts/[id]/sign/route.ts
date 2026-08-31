import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session-user";
import { hashContractBody } from "@/lib/contract";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

/**
 * Records a click-to-sign: the client's typed name, the exact time, their
 * IP and user agent, alongside a hash of the exact contract text they saw.
 *
 * This is a lightweight signature, not a certified e-signature platform —
 * there is no independent third-party audit trail the way DocuSign or
 * similar would provide. Reasonable for most small services agreements, but
 * SoftwarePros should have counsel confirm that's true for how this
 * business actually uses it before relying on it for a disputed contract.
 */

const Sign = z.object({ signerName: z.string().trim().min(1).max(200) });

export async function POST(
  request: Request,
  context: RouteContext<"/api/contracts/[id]/sign">,
) {
  const limit = rateLimit(clientKey(request, "contract-sign"), {
    limit: 10,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return tooManyRequests(limit, "Too many attempts. Try again shortly.");
  }

  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await context.params;
  const parsed = Sign.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "A typed name is required." }, { status: 400 });
  }

  const contract = await prisma.contract.findUnique({ where: { publicId: id } });
  if (!contract || contract.userId !== user.id) {
    return Response.json({ error: "Contract not found." }, { status: 404 });
  }
  if (contract.status === "SIGNED") {
    return Response.json({ error: "This contract is already signed." }, { status: 409 });
  }
  if (contract.status !== "SENT") {
    return Response.json(
      { error: "This contract is not yet available to sign." },
      { status: 409 },
    );
  }

  // The text a signature attests to must be exactly the text last approved
  // — if these ever diverge (they shouldn't), refuse rather than silently
  // let a signature bind to different words than what was recorded.
  if (hashContractBody(contract.bodyText) !== contract.bodyHash) {
    console.error(`[contracts] body/hash mismatch on sign, contract ${contract.id}`);
    return Response.json(
      { error: "This contract could not be verified. Contact SoftwarePros." },
      { status: 409 },
    );
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const signerIp = forwarded?.split(",")[0]?.trim() || null;

  const updated = await prisma.contract.update({
    where: { id: contract.id },
    data: {
      status: "SIGNED",
      signedAt: new Date(),
      signerName: parsed.data.signerName,
      signerIp,
      signerUserAgent: request.headers.get("user-agent"),
    },
    select: { publicId: true, status: true },
  });

  return Response.json({ ok: true, contract: updated });
}
