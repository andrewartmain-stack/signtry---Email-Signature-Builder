"use client"

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";

import {
    createClient
} from "../utils/supabase/client";
import Sidebar, { SidebarUserData } from "../components/Sidebar";
import { ToastProvider } from "./Toast";

import logo from '../../../public/logo-full.png'

export default function ClientLayoutWrapper({
    children,
    initialUserData
}: {
    children: React.ReactNode;
    initialUserData: SidebarUserData
}) {

    const [userData, setUserData] = useState<SidebarUserData | null>(initialUserData);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const fetchAuthenticatedUserData = async () => {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', user.id)
                .single();

            setUserData({
                id: initialUserData.id,
                fullName: profileData?.full_name as string,
                avatarUrl: profileData?.avatar_url as string | null,
                email: initialUserData.email,
                plan: initialUserData.plan,
            })
        }
    }

    return (
        <ToastProvider>
            <div className="flex h-full w-full flex-col lg:flex-row">
                {/* Desktop sidebar */}
                <div className="hidden h-full lg:block">
                    <Sidebar userData={userData} fetchAuthenticatedUserData={fetchAuthenticatedUserData} />
                </div>

                {/* Mobile top bar + drawer */}
                <div className="flex items-center justify-between border-b border-line bg-soft px-4 py-3 lg:hidden">
                    <img src={logo.src} width={100} alt="SignTry" />
                    <button
                        onClick={() => setIsMobileNavOpen(true)}
                        className="cursor-pointer rounded-full p-2 text-ink hover:bg-ink/[0.06]"
                        aria-label="Open menu"
                    >
                        <Menu className="size-5" />
                    </button>
                </div>
                <AnimatePresence>
                    {isMobileNavOpen && (
                        <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="absolute inset-0 bg-ink/40" onClick={() => setIsMobileNavOpen(false)} />
                            <motion.div
                                className="absolute inset-y-0 left-0"
                                initial={{ x: -280 }}
                                animate={{ x: 0 }}
                                exit={{ x: -280 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                            >
                                <Sidebar userData={userData} fetchAuthenticatedUserData={fetchAuthenticatedUserData} onNavigate={() => setIsMobileNavOpen(false)} />
                                <button
                                    onClick={() => setIsMobileNavOpen(false)}
                                    className="absolute top-4 right-3 cursor-pointer rounded-full p-2 text-ink hover:bg-ink/[0.06]"
                                    aria-label="Close menu"
                                >
                                    <X className="size-5" />
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="scrollbar-thin flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </ToastProvider>
    );
}
