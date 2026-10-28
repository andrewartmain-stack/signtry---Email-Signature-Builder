// Moves subscriptions on the old Basic / Professional prices to the new
// signature-quota prices: Basic -> 5 signatures, Professional -> 50, keeping
// the billing period. No proration: the new price starts at each
// subscription's next renewal, so nobody is charged mid-period.
// Also points each matching profile at its new price.
//
// Dry run (lists what would change):
//   node --env-file=.env scripts/stripe/migrate-legacy.mjs
// Apply:
//   node --env-file=.env scripts/stripe/migrate-legacy.mjs --apply [--live]
//
// Run setup-prices.mjs first. Tell customers about the new price before applying.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const apply = process.argv.includes('--apply');
const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
const isLive = key.startsWith('sk_live') || key.startsWith('rk_live');
if (isLive && apply && !process.argv.includes('--live')) {
  console.error('This is a live Stripe key. Add --live to change live subscriptions.');
  process.exit(1);
}

const stripe = new Stripe(key);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const LEGACY = {
  [process.env.NEXT_PUBLIC_PRICE_ID_BASIC_MONTHLY]: 'sig_5_month',
  [process.env.NEXT_PUBLIC_PRICE_ID_BASIC_YEARLY]: 'sig_5_year',
  [process.env.NEXT_PUBLIC_PRICE_ID_PROFESSIONAL_MONTHLY]: 'sig_50_month',
  [process.env.NEXT_PUBLIC_PRICE_ID_PROFESSIONAL_YEARLY]: 'sig_50_year',
};
delete LEGACY.undefined;

const targets = await stripe.prices.list({ lookup_keys: [...new Set(Object.values(LEGACY))], limit: 10 });
const byLookupKey = new Map(targets.data.map((price) => [price.lookup_key, price]));
if (byLookupKey.size < 4) throw new Error('New prices are missing. Run scripts/stripe/setup-prices.mjs first.');

console.log(`Stripe ${isLive ? 'LIVE' : 'test'} mode, ${apply ? 'APPLYING' : 'dry run'}\n`);

const money = (price) => `$${(price.unit_amount / 100).toFixed(2)}/${price.recurring.interval}`;
let count = 0;

for (const legacyPriceId of Object.keys(LEGACY)) {
  for await (const subscription of stripe.subscriptions.list({ price: legacyPriceId, status: 'all', limit: 100 })) {
    if (!['active', 'trialing', 'past_due'].includes(subscription.status)) continue;
    const item = subscription.items.data.find((entry) => entry.price.id === legacyPriceId);
    const target = byLookupKey.get(LEGACY[legacyPriceId]);
    const customer = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
    count++;
    console.log(`${subscription.id}  customer ${customer}  user ${subscription.metadata?.userId ?? '(no userId)'}  ${money(item.price)} -> ${target.lookup_key} ${money(target)}`);
    if (!apply) continue;

    await stripe.subscriptions.update(subscription.id, {
      items: [{ id: item.id, price: target.id }],
      proration_behavior: 'none',
    });

    if (subscription.metadata?.userId) {
      const { error } = await supabase.from('profiles').update({ price_id: target.id }).eq('id', subscription.metadata.userId);
      if (error) console.error(`  profile update failed: ${error.message}`);
    }
  }
}

// Profiles still pointing at a legacy price without a matching subscription
// (e.g. set by hand) are only reported, not changed.
const { data: profiles } = await supabase.from('profiles').select('id, price_id').in('price_id', Object.keys(LEGACY));
const leftover = (profiles ?? []).length;
console.log(`\n${count} subscription(s) ${apply ? 'migrated' : 'to migrate'}.`);
if (leftover) console.log(`${leftover} profile(s) still reference a legacy price${apply ? ' (no Stripe subscription found for them)' : ''}.`);
