// Plans are priced by signature quota; every feature is on every plan.
// Must match the public pricing page (signtry.com/pricing.html) exactly.
// Stripe prices are found by lookup key (sig_{n}_month / sig_{n}_year) and
// carry metadata.signature_limit, which is what the quota is read from.

export type BillingInterval = 'month' | 'year';

export interface PlanSize {
  signatures: number;
  monthly: number; // charged per month on monthly billing, USD
  yearly: number; // charged once a year on yearly billing, USD
}

export const PLAN_SIZES: PlanSize[] = [
  { signatures: 1, monthly: 4, yearly: 36 },
  { signatures: 5, monthly: 10, yearly: 84 },
  { signatures: 10, monthly: 14, yearly: 120 },
  { signatures: 25, monthly: 29, yearly: 264 },
  { signatures: 50, monthly: 52, yearly: 468 },
  { signatures: 100, monthly: 92, yearly: 828 },
  { signatures: 250, monthly: 199, yearly: 1788 },
];

// 500+ is sales-led, not self-serve
export const CUSTOM_PLAN_SIGNATURES = 500;
export const CUSTOM_PLAN_MAILTO = 'mailto:support@signtry.com?subject=SignTry%20for%20500%2B%20signatures';

export const YEARLY_SAVINGS_LABEL = 'Save 25%';

export const PLAN_FEATURES = [
  'Every template, for every industry',
  'Generate the whole team from a CSV',
  'Link-click analytics dashboard',
  'Verified badges, photos, logos and banners',
  'Booking buttons and social icons',
  'Hosted images that load in every inbox',
  'Works in Gmail, Outlook, Apple Mail, Yahoo and more',
];

export const lookupKey = (signatures: number, interval: BillingInterval) => `sig_${signatures}_${interval}`;

export function parseLookupKey(key: string | null | undefined): { size: PlanSize; interval: BillingInterval } | null {
  const match = key?.match(/^sig_(\d+)_(month|year)$/);
  if (!match) return null;
  const size = PLAN_SIZES.find(item => item.signatures === Number(match[1]));
  return size ? { size, interval: match[2] as BillingInterval } : null;
}

// What the pricing card shows: the monthly figure, and what is actually charged
export function planPrice(size: PlanSize, interval: BillingInterval) {
  const perMonth = interval === 'year' ? size.yearly / 12 : size.monthly;
  return {
    perMonth,
    charged: interval === 'year' ? size.yearly : size.monthly,
    perSignature: perMonth / size.signatures,
    yearlySaving: size.monthly * 12 - size.yearly,
  };
}

// Smallest plan that fits this many signatures; null means 500+ (contact sales)
export function planForSignatures(count: number): PlanSize | null {
  return PLAN_SIZES.find(size => size.signatures >= count) ?? null;
}

export const signaturesLabel = (count: number) => `${count} signature${count === 1 ? '' : 's'}`;

export function formatUsd(amount: number) {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 })}`;
}
