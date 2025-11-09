"use client"

import { createClient } from "../utils/supabase/client"
import { Button } from "@/components/ui/button"

const SignOutButton = ({ className }: { className?: string }) => {

    async function signout() {
        const supabase = await createClient();
        await supabase.auth.signOut();

        window.location.href = '/login'
    }

    return (
        <Button className={`cursor-pointer ${className}`} onClick={signout}>Sign Out</Button>
    )
}

export default SignOutButton


