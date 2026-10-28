import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import Stripe from 'stripe';

import { stripe } from '../../utils/stripe/stripe';
import { ACTIVE_STATUSES, ADMIN_PRICE_ID, findActiveSubscription } from '../../utils/stripe/plans';
import { supabaseAdmin } from '../../utils/supabase/admin';

const STRIPE_SIGNING_SECRET = process.env.STRIPE_SIGNING_SECRET!;

// The profile mirrors the subscription: subscribed while it is active (or
// past due while Stripe retries the card), and its current price, from which
// the signature quota is read.
async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.warn(`Subscription ${subscription.id} has no userId metadata; skipped`);
    return;
  }

  const isActive = ACTIVE_STATUSES.includes(subscription.status);

  // An old subscription ending must not cancel a newer one
  if (!isActive) {
    const current = await findActiveSubscription(userId);
    if (current && current.id !== subscription.id) subscription = current;
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      is_subscribed: ACTIVE_STATUSES.includes(subscription.status),
      price_id: ACTIVE_STATUSES.includes(subscription.status) ? subscription.items.data[0]?.price.id ?? null : null,
    })
    .eq('id', userId)
    // Never touch the admin account
    .or(`price_id.is.null,price_id.neq.${ADMIN_PRICE_ID}`);

  if (error) throw new Error(error.message);
  revalidatePath('/', 'layout');
}

async function retrieveSubscription(id: string | Stripe.Subscription | null | undefined) {
  if (!id) return null;
  return stripe.subscriptions.retrieve(typeof id === 'string' ? id : id.id);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature');

  if (!signature || !STRIPE_SIGNING_SECRET) {
    return NextResponse.json({ error: 'Missing Stripe signature or signing secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_SIGNING_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature check failed:', err);
    return NextResponse.json({ message: 'Webhook error' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription') break;
        const subscription = await retrieveSubscription(session.subscription);
        if (subscription) await syncSubscription(subscription);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(event.data.object);
        break;

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (event.type === 'invoice.payment_failed') {
          console.warn(`Payment failed for invoice ${invoice.id} (customer ${invoice.customer})`);
        }
        const subscription = await retrieveSubscription(invoice.parent?.subscription_details?.subscription);
        if (subscription) await syncSubscription(subscription);
        break;
      }
    }
  } catch (err) {
    // A 500 makes Stripe retry the event later
    console.error(`Stripe webhook ${event.type} failed:`, err);
    return NextResponse.json({ message: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
