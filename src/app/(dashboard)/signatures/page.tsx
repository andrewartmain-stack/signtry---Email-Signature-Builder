import { redirect } from 'next/navigation'

import SignaturesClient from './SignaturesClient'

import { createClient } from '../../utils/supabase/server'

export default async function SignaturesPage() {

    const supabase = await createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    const { data: profile, error: errorGettingProfile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();

    if (errorGettingProfile) {
        console.error(errorGettingProfile.message);
        redirect('/login');
    }

    if (profile.is_subscribed === false) {
        redirect('/subscription-plan');
    }

    const { data: signatures, error: signaturesError } = await supabase
        .from('saved_signatures')
        .select('*')
        .eq('user_id', data.user.id);

    if (signaturesError) {
        console.error(signaturesError)
    }

    return <SignaturesClient initialSignatures={signatures ? signatures : []} />
}