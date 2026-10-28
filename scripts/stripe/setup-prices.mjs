// Creates the SignTry product and its 14 recurring prices (7 sizes x monthly/yearly),
// and sets up the Customer Portal for card updates, invoices and cancellation.
// Safe to run again: existing lookup keys are left alone.
//
//   node --env-file=.env scripts/stripe/setup-prices.mjs          # test mode key only
//   node --env-file=.env scripts/stripe/setup-prices.mjs --live   # required for a live key
//
// Amounts must match PLAN_SIZES in src/app/utils/plans.ts and the public pricing page.

import Stripe from 'stripe';

const PLAN_SIZES = [
  { signatures: 1, monthly: 4, yearly: 36 },
  { signatures: 5, monthly: 10, yearly: 84 },
  { signatures: 10, monthly: 14, yearly: 120 },
  { signatures: 25, monthly: 29, yearly: 264 },
  { signatures: 50, monthly: 52, yearly: 468 },
  { signatures: 100, monthly: 92, yearly: 828 },
  { signatures: 250, monthly: 199, yearly: 1788 },
];

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
const isLive = key.startsWith('sk_live') || key.startsWith('rk_live');
if (isLive && !process.argv.includes('--live')) {
  console.error('This is a live Stripe key. Run again with --live to change the live account.');
  process.exit(1);
}

const stripe = new Stripe(key);
console.log(`Stripe ${isLive ? 'LIVE' : 'test'} mode\n`);

// 1. Product
// Listed rather than searched: search lags behind products created moments ago
let found = null;
for await (const item of stripe.products.list({ active: true, limit: 100 })) {
  if (item.metadata?.app === 'signtry') { found = item; break; }
}
const product = found ?? await stripe.products.create({
  name: 'SignTry',
  description: 'Email signatures priced by the number of signatures. Every feature on every plan.',
  metadata: { app: 'signtry' },
});
console.log(`Product ${product.id} (${found ? 'existing' : 'created'})`);

// 2. Prices
const wanted = PLAN_SIZES.flatMap((size) => [
  { size, interval: 'month', amount: size.monthly },
  { size, interval: 'year', amount: size.yearly },
]).map((item) => ({ ...item, lookupKey: `sig_${item.size.signatures}_${item.interval}` }));

const existing = new Map();
for (let i = 0; i < wanted.length; i += 10) {
  const keys = wanted.slice(i, i + 10).map((item) => item.lookupKey);
  const result = await stripe.prices.list({ lookup_keys: keys, limit: 10 });
  result.data.forEach((price) => existing.set(price.lookup_key, price));
}

const priceIds = [];
for (const item of wanted) {
  const found = existing.get(item.lookupKey);
  if (found) {
    const ok = found.active && found.unit_amount === item.amount * 100 && found.recurring?.interval === item.interval
      && found.metadata?.signature_limit === String(item.size.signatures);
    console.log(`${ok ? '  ok     ' : '  CHECK  '} ${item.lookupKey}  ${found.id}${ok ? '' : '  (amount, interval, metadata or active flag differs; fix by hand)'}`);
    priceIds.push(found.id);
    continue;
  }
  const price = await stripe.prices.create({
    product: product.id,
    currency: 'usd',
    unit_amount: item.amount * 100,
    recurring: { interval: item.interval },
    tax_behavior: 'exclusive',
    lookup_key: item.lookupKey,
    nickname: `${item.size.signatures} signature${item.size.signatures === 1 ? '' : 's'}, ${item.interval === 'year' ? 'yearly' : 'monthly'}`,
    metadata: { signature_limit: String(item.size.signatures) },
  });
  console.log(`  created  ${item.lookupKey}  ${price.id}  $${item.amount}/${item.interval}`);
  priceIds.push(price.id);
}

// 3. Customer Portal. Plan changes happen in the dashboard (it blocks
// downgrades below the number of saved signatures), so the portal only
// handles cards, invoices and cancellation at the end of the paid period.
const portalFeatures = {
  customer_update: { enabled: true, allowed_updates: ['email', 'address', 'tax_id'] },
  invoice_history: { enabled: true },
  payment_method_update: { enabled: true },
  subscription_cancel: { enabled: true, mode: 'at_period_end' },
  subscription_update: { enabled: false },
};
const configs = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 });
if (configs.data[0]) {
  await stripe.billingPortal.configurations.update(configs.data[0].id, { features: portalFeatures });
  console.log(`\nPortal ${configs.data[0].id} updated`);
} else {
  const config = await stripe.billingPortal.configurations.create({ features: portalFeatures });
  console.log(`\nPortal ${config.id} created`);
}

console.log(`\nDone: ${priceIds.length} prices on product ${product.id}.`);
