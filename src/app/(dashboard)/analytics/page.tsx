import { redirect } from 'next/navigation'

import AnalyticsClient from './AnalyticsClient'

import { createClient } from '../../utils/supabase/server'
import { SavedSignatureDataInterface } from '../../types'

export default async function AnalyticsPage() {

    const supabase = await createClient()

    const { data: userData, error } = await supabase.auth.getUser()
    if (error || !userData?.user) {
        redirect('/login')
    }

    const { data: profile, error: errorGettingProfile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single();

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
        .eq('user_id', userData.user.id);

    if (signaturesError) {
        console.error(signaturesError)
    }


    let clicksAnalyticsData = [];
    let linksAnalyticsData = [];

    if (signatures?.length) {
        const { data: clicksData, error: errorFetchingClicksAnalytics } = await supabase
            .from('signature_clicks')
            .select('*')
            .eq('signature_id', signatures[0].id);

        if (errorFetchingClicksAnalytics) {
            console.error(errorFetchingClicksAnalytics.message);
        }

        if (clicksData) {
            clicksAnalyticsData = clicksData;
        }

        const { data: linksData, error: errorFetchingLinksData } = await supabase.from("signature_links").select("*").eq('signature_id', signatures[0].id);

        if (errorFetchingLinksData) {
            console.error(errorFetchingLinksData.message);
        }

        if (linksData) {
            linksAnalyticsData = linksData;
        }
    }

    return <AnalyticsClient savedSignatures={signatures as SavedSignatureDataInterface[]} initialAnalyticsData={clicksAnalyticsData} initialLinksData={linksAnalyticsData} />
}