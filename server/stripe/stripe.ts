import Stripe from "stripe";
import { ENV } from "../_core/env";

/**
 * Stripe client instance
 * Uses the secret key from environment
 * Optional in development mode
 */
const stripeKey = ENV.stripeSecretKey;
export const stripe = stripeKey && stripeKey !== "sk_test_placeholder"
  ? new Stripe(stripeKey)
  : null;

const isStripeEnabled = (): boolean => {
  if (!stripe) {
    console.warn("[Stripe] Not configured - payment features disabled");
    return false;
  }
  return true;
};

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  userName,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: number;
  userEmail: string;
  userName?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  if (!isStripeEnabled() || !stripe) {
    throw new Error("Stripe not configured");
  }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName || "",
    },
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return { url: session.url };
}

/**
 * Create or get a Stripe customer for a user
 */
export async function getOrCreateCustomer({
  userId,
  email,
  name,
}: {
  userId: number;
  email: string;
  name?: string;
}): Promise<string> {
  if (!isStripeEnabled() || !stripe) {
    throw new Error("Stripe not configured");
  }
  // Search for existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      user_id: userId.toString(),
    },
  });

  return customer.id;
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  if (!isStripeEnabled() || !stripe) {
    return null;
  }
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error("[Stripe] Error retrieving subscription:", error);
    return null;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  if (!isStripeEnabled() || !stripe) {
    return false;
  }
  try {
    await stripe.subscriptions.cancel(subscriptionId);
    return true;
  } catch (error) {
    console.error("[Stripe] Error canceling subscription:", error);
    return false;
  }
}

/**
 * Get customer portal URL
 */
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  if (!isStripeEnabled() || !stripe) {
    throw new Error("Stripe not configured");
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return { url: session.url };
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: Buffer,
  signature: string
): Stripe.Event {
  if (!isStripeEnabled() || !stripe) {
    throw new Error("Stripe not configured");
  }
  const webhookSecret = ENV.stripeWebhookSecret;

  if (!webhookSecret) {
    throw new Error("Stripe webhook secret not configured");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
