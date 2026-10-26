import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from './server';

// Deduplicated per request: the dashboard layout and the page render in the
// same request, so they share a single auth + profile round trip.
export const getSession = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error(error.message);
  }

  return { supabase, user, profile };
});

// For dashboard pages: requires a signed-in, subscribed user.
export async function requireSubscribedSession() {
  const { supabase, user, profile } = await getSession();

  if (!user || !profile) {
    redirect('/login');
  }

  if (profile.is_subscribed === false) {
    redirect('/subscription-plan');
  }

  return { supabase, user, profile };
}
