import { createClient } from "../../utils/supabase/server";
import { redirect } from 'next/navigation'
import PricingSection from "../../components/PricingSection"
import SignOutButton from "../../components/SignOutButton";

export default async function ChoosePlanPage() {

    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    return (
        <div className="relative w-full h-full flex justify-center items-center">
            <SignOutButton className="fixed top-5 right-10" />
            <PricingSection userId={data.user.id} />
        </div>
    )
}