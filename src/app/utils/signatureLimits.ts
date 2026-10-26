import type { SupabaseClient } from '@supabase/supabase-js';

const SIGNATURE_LIMITS: Record<string, number> = {
  [process.env.NEXT_PUBLIC_PRICE_ID_BASIC_MONTHLY!]: 5, // Basic monthly
  [process.env.NEXT_PUBLIC_PRICE_ID_BASIC_YEARLY!]: 5, // Basic yearly
  [process.env.NEXT_PUBLIC_PRICE_ID_PROFESSIONAL_MONTHLY!]: 50, // Professional monthly
  [process.env.NEXT_PUBLIC_PRICE_ID_PROFESSIONAL_YEARLY!]: 50, // Professional yearly
  ['unlimited_edition_for_admin_only']: 10000, // Admin Only
};

export async function getSignatureQuota(supabase: SupabaseClient, userId: string) {
  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from('profiles').select('price_id').eq('id', userId).single(),
    supabase
      .from('saved_signatures')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  const limit = SIGNATURE_LIMITS[profile?.price_id] ?? 5;
  const used = count ?? 0;

  return { limit, used, remaining: Math.max(limit - used, 0) };
}
