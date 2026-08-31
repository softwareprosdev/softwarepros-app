import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

/**
 * Stripe calls this directly — it is deliberately outside the Supabase-auth
 * gate in proxy.ts (see AUTH_REQUIRED_API_PREFIXES there) and authenticates
 * the caller by verifying Stripe's signature instead of a session cookie.
 * This is the ONLY place a Payment (and therefore a contract's deposit) is
 * ever marked PAID — never the browser returning to the Checkout success
 * URL, which proves nothing about whether money actually moved.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhooks:stripe] STRIPE_WEBHOOK_SECRET is not set.");
    return Response.json({ error: "Not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing signature." }, { status: 400 });
  }

  // Signature verification needs the exact raw bytes Stripe signed — never
  // request.json() first, which would re-serialize the body and break it.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    console.error("[webhooks:stripe] signature verification failed", error);
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await markPaid(session);
  }

  return Response.json({ received: true });
}

async function markPaid(session: Stripe.Checkout.Session) {
  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (!payment) {
    // Not necessarily an error — could be a Checkout Session this app never
    // created. Log it either way so a mismatch doesn't disappear silently.
    console.error(`[webhooks:stripe] no Payment row for session ${session.id}`);
    return;
  }
  // Webhooks can be delivered more than once — this makes a re-delivery a
  // no-op instead of double-processing a payment.
  if (payment.status === "PAID") return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
    },
  });
}
