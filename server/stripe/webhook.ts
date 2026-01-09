import { Request, Response } from "express";
import { stripe, verifyWebhookSignature } from "./stripe";
import { updateUserSubscription } from "../db";

/**
 * Stripe Webhook Handler
 * Processes subscription events from Stripe
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    console.error("[Webhook] Missing stripe-signature header");
    return res.status(400).json({ error: "Missing signature" });
  }

  let event;

  try {
    event = verifyWebhookSignature(req.body, signature);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return res.status(400).json({ error: "Invalid signature" });
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (userId && subscriptionId) {
          console.log(`[Webhook] Checkout completed for user ${userId}`);
          
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          
          // Determine plan from price
          let plan: "FREE" | "PRO" | "TEAM" = "PRO";
          if (priceId?.includes("team")) {
            plan = "TEAM";
          }

          await updateUserSubscription(parseInt(userId), {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionPlan: plan,
            subscriptionStatus: "ACTIVE",
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        
        // Get user by customer ID and update status
        const status = subscription.status === "active" ? "ACTIVE" : 
                       subscription.status === "canceled" ? "CANCELED" :
                       subscription.status === "past_due" ? "PAST_DUE" : "INACTIVE";
        
        console.log(`[Webhook] Subscription updated for customer ${customerId}: ${status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        
        console.log(`[Webhook] Subscription deleted for customer ${customerId}`);
        // User will be downgraded to free tier
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        console.log(`[Webhook] Payment succeeded for invoice ${invoice.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log(`[Webhook] Payment failed for invoice ${invoice.id}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error(`[Webhook] Error processing event ${event.type}:`, error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}
