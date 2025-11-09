"use client"

import {
    createClient
} from "../utils/supabase/client";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

export default function ClientLayoutWrapper({
    children,
    initialUserData
}: {
    children: React.ReactNode;
    initialUserData: { id: string, fullName: string, avatarUrl: string | null, email: string }
}) {

    const [userData, setUserData] = useState<{ id: string, fullName: string, avatarUrl: string | null, email: string } | null>(initialUserData);


    const fetchAuthenticatedUserData = async () => {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let fullName: string = '';
        let avatarUrl: string | null = null;

        if (user) {
            // Fetch the full name from the 'profiles' table
            const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', user.id)
                .single();

            fullName = profileData?.full_name as string;
            // email = profileData?.email as string;
            avatarUrl = profileData?.avatar_url as string | null;

            setUserData({ id: initialUserData.id, fullName, avatarUrl, email: initialUserData.email })
        }
    }

    return (
        <div className="flex w-full h-full"> {/* Этот div теперь будет внутри <main> из RootLayout */}
            <Sidebar userData={userData} fetchAuthenticatedUserData={fetchAuthenticatedUserData} />
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
