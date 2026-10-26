import SignaturesClient from './SignaturesClient'

import { requireSubscribedSession } from '../../utils/supabase/session'

export default async function SignaturesPage() {

    const { supabase, user } = await requireSubscribedSession()

    const { data: signatures, error: signaturesError } = await supabase
        .from('saved_signatures')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: false });

    if (signaturesError) {
        console.error(signaturesError)
    }

    return <SignaturesClient initialSignatures={signatures ? signatures : []} />
}
