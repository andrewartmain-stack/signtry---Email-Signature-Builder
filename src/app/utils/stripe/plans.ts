import type Stripe from 'stripe';

import { stripe } from './stripe';
import { BillingInterval, lookupKey, parseLookupKey, signaturesLabel } from '../plans';

export const ADMIN_PRICE_ID = 'unlimited_edition_for_admin_only';

// Subscriptions in these states keep access (past_due: Stripe is retrying the card)
export const ACTIVE_STATUSES: Stripe.Subscription.Status[] = ['active', 'trialing', 'past_due'];

// Old Basic / Professional prices. Their Stripe prices have no
// signature_limit metadata, so the limits live here until every
// subscription is migrated (scripts/stripe/migrate-legacy.mjs).
const LEGACY_PLANS: Record<string, { limit: number; label: string }> = Object.fromEntries(
  [
    [process.env.NEXT_PUBLIC_PRICE_ID_BASIC_MONTHLY, { limit: 5, label: 'Basic' }],
    [process.env.NEXT_PUBLIC_PRICE_ID_BASIC_YEARLY, { limit: 5, label: 'Basic' }],
    [process.env.NEXT_PUBLIC_PRICE_ID_PROFESSIONAL_MONTHLY, { limit: 50, label: 'Professional' }],
    [process.env.NEXT_PUBLIC_PRICE_ID_PROFESSIONAL_YEARLY, { limit: 50, label: 'Professional' }],
  ].filter((entry): entry is [string, { limit: number; label: string }] => Boolean(entry[0]))
);

export interface Plan {
  priceId: string;
  limit: number;
  label: string;
  // Set for current plans; null for legacy, one-time and admin
  signatures: number | null;
  interval: BillingInterval | null;
  isLegacy: boolean;
}

// Prices never change once created, so one lookup per server instance is enough
const priceCache = new Map<string, Promise<Stripe.Price | null>>();

function retrievePrice(priceId: string) {
  let price = priceCache.get(priceId);
  if (!price) {
    price = stripe.prices.retrieve(priceId).catch((error) => {
      console.error(`Could not load Stripe price ${priceId}:`, error.message);
      priceCache.delete(priceId);
      return null;
    });
    priceCache.set(priceId, price);
  }
  return price;
}

export async function getPlanForPrice(priceId: string | null | undefined): Promise<Plan | null> {
  if (!priceId) return null;

  if (priceId === ADMIN_PRICE_ID) {
    return { priceId, limit: 10000, label: 'Admin', signatures: null, interval: null, isLegacy: false };
  }

  const legacy = LEGACY_PLANS[priceId];
  if (legacy) return { priceId, ...legacy, signatures: null, interval: null, isLegacy: true };

  const price = await retrievePrice(priceId);
  if (!price) return null;

  const parsed = parseLookupKey(price.lookup_key);
  const limit = Number(price.metadata?.signature_limit);
  if (parsed && limit > 0) {
    return { priceId, limit, label: signaturesLabel(limit), signatures: limit, interval: parsed.interval, isLegacy: false };
  }

  // The old $10 one-time "Single Signature" purchase: 1 signature, lifetime
  if (price.type === 'one_time') {
    return { priceId, limit: 1, label: 'Single signature', signatures: null, interval: null, isLegacy: true };
  }

  return null;
}

const lookupCache = new Map<string, Promise<Stripe.Price | null>>();

export function getPriceByLookupKey(signatures: number, interval: BillingInterval) {
  const key = lookupKey(signatures, interval);
  let price = lookupCache.get(key);
  if (!price) {
    price = stripe.prices.list({ lookup_keys: [key], active: true, limit: 1 }).then(
      (result) => result.data[0] ?? null,
      (error) => {
        console.error(`Could not load Stripe price ${key}:`, error.message);
        return null;
      }
    );
    price.then((result) => { if (!result) lookupCache.delete(key); });
    lookupCache.set(key, price);
  }
  return price;
}

// Subscriptions carry metadata.userId (set at checkout), which is how they
// are matched to accounts; profiles only store the current price id.
export async function findActiveSubscription(userId: string, email?: string | null): Promise<Stripe.Subscription | null> {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return null;

  const pickActive = (subscriptions: Stripe.Subscription[]) => subscriptions
    .filter((subscription) => subscription.metadata?.userId === userId && ACTIVE_STATUSES.includes(subscription.status))
    .sort((a, b) => b.created - a.created)[0] ?? null;

  const searched = await stripe.subscriptions.search({ query: `metadata['userId']:'${userId}'`, limit: 10 });
  const found = pickActive(searched.data);
  if (found || !email) return found;

  // Search lags up to a minute behind new subscriptions; the customer's
  // own subscription list does not
  const customer = await findCustomerByEmail(email);
  if (!customer) return null;
  const listed = await stripe.subscriptions.list({ customer: customer.id, status: 'all', limit: 10 });
  return pickActive(listed.data);
}

// What Billing shows, read straight from Stripe so it is right even before
// a webhook arrives. Falls back to the profile's price (admin, one-time).
export async function getBillingSummary(userId: string, email: string | null | undefined, profilePriceId: string | null | undefined) {
  const subscription = await findActiveSubscription(userId, email).catch((error) => {
    console.error('Could not load subscription:', error.message);
    return null;
  });
  const item = subscription?.items.data[0];
  const plan = await getPlanForPrice(item?.price.id ?? profilePriceId);
  if (!plan) return null;
  return {
    plan,
    hasSubscription: Boolean(subscription),
    status: subscription?.status ?? null,
    // Unix seconds; set when the subscription is cancelled but still paid for
    endsAt: subscription?.cancel_at ?? (subscription?.cancel_at_period_end ? item?.current_period_end ?? null : null),
    renewsAt: item?.current_period_end ?? null,
  };
}

export async function findCustomerByEmail(email: string) {
  const result = await stripe.customers.list({ email, limit: 1 });
  return result.data[0] ?? null;
}
