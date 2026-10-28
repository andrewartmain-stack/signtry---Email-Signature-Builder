import type { SupabaseClient } from '@supabase/supabase-js';

import { getPlanForPrice } from './stripe/plans';

// The quota is the number of saved signatures the plan allows; it comes
// from the plan's Stripe price (metadata.signature_limit).
export async function getSignatureQuota(supabase: SupabaseClient, userId: string) {
  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from('profiles').select('price_id, is_subscribed').eq('id', userId).single(),
    supabase
      .from('saved_signatures')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  const plan = profile?.is_subscribed ? await getPlanForPrice(profile.price_id) : null;
  const limit = plan?.limit ?? 0;
  const used = count ?? 0;

  return { limit, used, remaining: Math.max(limit - used, 0) };
}
