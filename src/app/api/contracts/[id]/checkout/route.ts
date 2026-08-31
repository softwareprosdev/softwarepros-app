import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session-user";
import { stripe, hasStripeCredentials } from "@/lib/stripe";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

/**
 * Creates a Stripe Checkout Session for the signed contract's deposit and
 * returns its URL for the browser to redirect to. Payment is confirmed only
 * by the webhook (api/webhooks/stripe) — never by the browser returning to
 * the success URL, which a client could reach without ever actually paying.
 */
export async function POST(
  request: Request,
  context: RouteContext<"/api/contracts/[id]/checkout">,
) {
  const limit = rateLimit(clientKey(request, "contract-checkout"), {
    limit: 10,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return tooManyRequests(limit, "Too many attempts. Try again shortly.");
  }

  if (!hasStripeCredentials()) {
    return Response.json(
      { error: "Payments are not configured (STRIPE_SECRET_KEY)." },
      { status: 503 },
    );
  }

  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await context.params;
  const contract = await prisma.contract.findUnique({
    where: { publicId: id },
    include: {
      payments: { where: { status: "PAID" }, take: 1 },
    },
  });
  if (!contract || contract.userId !== user.id) {
    return Response.json({ error: "Contract not found." }, { status: 404 });
  }
  if (contract.status !== "SIGNED") {
    return Response.json(
      { error: "Sign the contract before paying the deposit." },
      { status: 409 },
    );
  }
  if (contract.payments.length > 0) {
    return Response.json({ error: "The deposit is already paid." }, { status: 409 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const checkoutSession = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: contract.clientEmail || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: contract.currency,
            unit_amount: contract.depositCents,
            product_data: {
              name: `Deposit — ${contract.projectTitle}`,
              description:
                "50% project deposit, per the signed SoftwarePros services agreement.",
            },
          },
        },
      ],
      success_url: `${siteUrl}/contract/${contract.publicId}?paid=1`,
      cancel_url: `${siteUrl}/contract/${contract.publicId}`,
      metadata: { contractId: contract.id },
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a Checkout URL.");
    }

    await prisma.payment.create({
      data: {
        contractId: contract.id,
        stripeSessionId: checkoutSession.id,
        amountCents: contract.depositCents,
        currency: contract.currency,
        status: "PENDING",
      },
    });

    return Response.json({ url: checkoutSession.url }, { status: 201 });
  } catch (error) {
    console.error("[contracts] checkout session creation failed", error);
    return Response.json(
      { error: "Could not start checkout. Please try again." },
      { status: 502 },
    );
  }
}
