import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import Title from '../../components/Title';
import EmailGuidesTabs from '../../components/EmailGuidesTabs';

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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <Title text="Setup Guides" tag="h2" />
                    <p className="text-gray-600 mt-2 max-w-3xl">
                        Step-by-step instructions for setting up your email signature across different providers.
                        First, copy your signature from the Signatures tab, then follow the guide for your email provider.
                    </p>
                </div>

                <EmailGuidesTabs />
            </div>
        </div>
    )
}