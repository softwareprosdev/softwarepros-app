import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

const Body = z.object({ email: z.email().max(320) });

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "newsletter"), {
    limit: 10,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return tooManyRequests(limit, "Too many requests. Try again shortly.");
  }

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();

  // Idempotent: re-subscribing is a no-op rather than an error.
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  return Response.json({ ok: true }, { status: 201 });
}
