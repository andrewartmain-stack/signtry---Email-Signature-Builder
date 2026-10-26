import AnalyticsClient from './AnalyticsClient'

import { requireSubscribedSession } from '../../utils/supabase/session'
import { SavedSignatureDataInterface } from '../../types'

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ signature?: string }> }) {

    const [{ supabase, user }, { signature: requestedId }] = await Promise.all([
        requireSubscribedSession(),
        searchParams,
    ])

    const { data: signatures, error: signaturesError } = await supabase
        .from('saved_signatures')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: false });

    if (signaturesError) {
        console.error(signaturesError)
    }

    // "Analytics" on a signature card links here with ?signature=<id>
    const selected = signatures?.find(signature => String(signature.id) === requestedId) ?? signatures?.[0];

    let clicksAnalyticsData = [];
    let linksAnalyticsData = [];

    if (selected) {
        // Clicks and links of the selected signature are independent, fetch both at once
        const [clicksResult, linksResult] = await Promise.all([
            supabase.from('signature_clicks').select('*').eq('signature_id', selected.id),
            supabase.from('signature_links').select('*').eq('signature_id', selected.id),
        ]);

        if (clicksResult.error) {
            console.error(clicksResult.error.message);
        }

        if (clicksResult.data) {
            clicksAnalyticsData = clicksResult.data;
        }

        if (linksResult.error) {
            console.error(linksResult.error.message);
        }

        if (linksResult.data) {
            linksAnalyticsData = linksResult.data;
        }
    }

    return <AnalyticsClient
        key={selected?.id ?? 'none'}
        savedSignatures={(signatures ?? []) as SavedSignatureDataInterface[]}
        initialSignatureId={selected?.id ?? null}
        initialAnalyticsData={clicksAnalyticsData}
        initialLinksData={linksAnalyticsData}
    />
}
