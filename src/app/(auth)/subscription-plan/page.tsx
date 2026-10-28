import { redirect } from 'next/navigation'

import { createClient } from "../../utils/supabase/server";
import PlanPicker from "../../components/PlanPicker"
import SignOutButton from "../../components/SignOutButton";

export default async function ChoosePlanPage() {

    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    return (
        <div className="relative flex min-h-full w-full justify-center px-4 py-16 md:py-24">
            <SignOutButton className="fixed top-5 right-5 md:right-10" />
            <div className="flex w-full max-w-[960px] flex-col gap-8">
                <div className="flex flex-col items-center gap-3 text-center">
                    <h1 className="text-[34px] text-ink md:text-[44px]">Choose your plan</h1>
                    <p className="max-w-xl text-[15px] text-muted-foreground">
                        Every feature on every plan. Pay only for the number of signatures you need, and change the size any time from Billing.
                    </p>
                </div>
                <PlanPicker mode="subscribe" />
            </div>
        </div>
    )
}
