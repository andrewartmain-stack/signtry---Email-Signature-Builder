'use server';

import { revalidatePath } from 'next/cache';

import { stripe } from './stripe';
import { findActiveSubscription, findCustomerByEmail, getPriceByLookupKey } from './plans';
import { createClient } from '../supabase/server';
import { supabaseAdmin } from '../supabase/admin';
import { BillingInterval, PLAN_SIZES, signaturesLabel } from '../plans';

type ActionResult = { url?: string; error?: string };

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function validPlan(signatures: number, interval: BillingInterval) {
  return PLAN_SIZES.some((size) => size.signatures === signatures) && (interval === 'month' || interval === 'year');
}

// New subscription through Stripe Checkout
export async function startCheckoutAction(signatures: number, interval: BillingInterval): Promise<ActionResult> {
  const { user } = await getUser();
  if (!user) return { error: 'Please sign in again.' };
  if (!validPlan(signatures, interval)) return { error: 'This plan is not available.' };

  try {
    if (await findActiveSubscription(user.id, user.email)) {
      return { error: 'You already have a plan. Change its size from Billing.' };
    }

    const price = await getPriceByLookupKey(signatures, interval);
    if (!price) return { error: 'This plan is not available right now. Please try again later.' };

    // Reuse the Stripe customer if this email has bought before
    const customer = user.email ? await findCustomerByEmail(user.email) : null;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: price.id, quantity: 1 }],
      ...(customer ? { customer: customer.id } : { customer_email: user.email }),
      client_reference_id: user.id,
      metadata: { userId: user.id, priceId: price.id },
      subscription_data: { metadata: { userId: user.id } },
      success_url: `${BASE_URL}/generateSignature`,
      cancel_url: `${BASE_URL}/subscription-plan`,
    });

    return session.url ? { url: session.url } : { error: 'Could not open checkout. Please try again.' };
  } catch (error) {
    console.error('Checkout failed:', error);
    return { error: 'Could not open checkout. Please try again.' };
  }
}

// Swap the subscription's price; Stripe prorates the difference on the next invoice
export async function changePlanAction(signatures: number, interval: BillingInterval): Promise<ActionResult> {
  const { supabase, user } = await getUser();
  if (!user) return { error: 'Please sign in again.' };
  if (!validPlan(signatures, interval)) return { error: 'This plan is not available.' };

  try {
    const [subscription, price, { count }] = await Promise.all([
      findActiveSubscription(user.id, user.email),
      getPriceByLookupKey(signatures, interval),
      supabase.from('saved_signatures').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);

    if (!subscription) return { error: 'We could not find your subscription. Contact support@signtry.com.' };
    if (!price) return { error: 'This plan is not available right now. Please try again later.' };

    const item = subscription.items.data[0];
    if (item.price.id === price.id) return { error: 'You are already on this plan.' };

    // Downgrades below current usage are blocked until signatures are deleted
    const used = count ?? 0;
    if (used > signatures) {
      const extra = used - signatures;
      return { error: `You have ${signaturesLabel(used)}. Delete ${extra} to switch to ${signaturesLabel(signatures)}.` };
    }

    await stripe.subscriptions.update(subscription.id, {
      items: [{ id: item.id, price: price.id }],
      proration_behavior: 'create_prorations',
      metadata: { ...subscription.metadata, userId: user.id },
    });

    // The webhook does the same; updating now shows the new quota right away
    const { error } = await supabaseAdmin.from('profiles').update({ price_id: price.id, is_subscribed: true }).eq('id', user.id);
    if (error) console.error('Profile update after plan change failed:', error.message);

    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Plan change failed:', error);
    return { error: 'Could not change your plan. Your card was not charged. Please try again.' };
  }
}

// Stripe Customer Portal: card, invoices and cancellation
export async function openBillingPortalAction(): Promise<ActionResult> {
  const { user } = await getUser();
  if (!user) return { error: 'Please sign in again.' };

  try {
    const subscription = await findActiveSubscription(user.id, user.email);
    const customerId = subscription
      ? (typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id)
      : user.email ? (await findCustomerByEmail(user.email))?.id : undefined;

    if (!customerId) return { error: 'No billing account found for your email yet.' };

    const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${BASE_URL}/billing` });
    return { url: session.url };
  } catch (error) {
    console.error('Billing portal failed:', error);
    return { error: 'Could not open billing. Please try again.' };
  }
}
