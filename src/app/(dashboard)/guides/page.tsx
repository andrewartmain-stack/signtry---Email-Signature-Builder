import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import Title from '../../components/Title';

export default async function Guides() {

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


    return (
        <div className="p-10 flex w-full justify-between">
            <Title text="Guides" tag="h2" />
        </div>
    )
}