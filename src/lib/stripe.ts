import "server-only";
import Stripe from "stripe";

/**
 * Shared Stripe client. `STRIPE_SECRET_KEY` is server-only — never prefix it
 * with NEXT_PUBLIC_ or it ships in the client bundle. This flow uses
 * server-created Checkout Sessions (see api/contracts/[id]/checkout), so no
 * publishable key or Stripe.js is needed in the browser at all.
 */
let client: Stripe | null = null;

export function stripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment.",
    );
  }
  client = new Stripe(key);
  return client;
}

export function hasStripeCredentials(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
