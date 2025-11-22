"use client";

import React, { FC, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Avatar from './Avatar';
import Marker from './Marker';

import {
    PlusSquare,
    Package,
    BarChart3,
    Video,
    CircleDollarSign,
    Settings,
    LogOut,
} from 'lucide-react';

import avatar from "../../../public/avatar.png"
import logo from '../../../public/logo-full.png'
import { SettingsModal } from './SettingsModal';

const Sidebar: FC<{ userData: { id: string, fullName: string, avatarUrl: string | null, email: string, plan: string } | null, fetchAuthenticatedUserData: () => void }> = ({ userData, fetchAuthenticatedUserData }) => {

    const [isSettignsOpen, setIsSettingsOpen] = useState<boolean>(false);

    const navLinks = [
        { href: "/generateSignature", icon: PlusSquare, label: "Generate" },
        { href: "/signatures", icon: Package, label: "Signatures" },
        { href: "/analytics", icon: BarChart3, label: "Analytics" },
        { href: "/guides", icon: Video, label: "Guides" },
        { href: "https://billing.stripe.com/p/login/cNi6oGeER2vo0NU1Ng93y00", icon: CircleDollarSign, label: "Manage Subscriptions" },
    ];

    const pathName = usePathname();

    async function signout() {
        const supabase = await createClient();
        await supabase.auth.signOut();

        window.location.href = '/login'
    }

    return (
        <>
            {userData && <SettingsModal userProfile={{ id: userData.id, fullName: userData.fullName, avatarUrl: userData.avatarUrl, email: userData.email }} isOpen={isSettignsOpen} setIsOpen={setIsSettingsOpen} fetchAuthenticatedUserData={fetchAuthenticatedUserData} />}

            <aside className="bg-slate-50 w-[240px] p-4 h-screen flex flex-col justify-between border-r border-slate-200">
                <div>
                    {/* --- Логотип --- */}
                    <div className="px-2 mb-8">
                        <img src={logo.src} width={120} alt="logo" />
                    </div>

                    {/* --- Основная навигация --- */}
                    <nav>
                        <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</h3>
                        <ul className="flex flex-col gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathName === link.href;
                                return (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group ${isActive
                                                ? 'bg-[linear-gradient(135deg,rgba(99,102,241,0.6),rgba(139,92,246,0.3),rgb(174,209,255),rgba(174,209,255,0))] text-white shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                                }`}
                                        >
                                            <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />
                                            <span>{link.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>

                <div className="border-t border-slate-200 pt-4">
                    <div className="flex w-full items-center gap-3 mb-3 relative p-2">
                        <Avatar src={userData?.avatarUrl ? userData.avatarUrl : avatar.src} />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800">{userData?.fullName}</span>
                            <Marker>{userData?.plan}</Marker>
                        </div>
                    </div>

                    <ul className="flex flex-col">
                        <li>
                            <button onClick={() => setIsSettingsOpen(true)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 rounded-md hover:bg-slate-200 cursor-pointer">
                                <Settings className="h-5 w-5 text-slate-500" />
                                Settings
                            </button>
                        </li>
                        <li>
                            <button onClick={signout} className="flex cursor-pointer w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 rounded-md hover:bg-red-50 hover:text-red-600">
                                <LogOut className="h-5 w-5 text-slate-500" />
                                Log out
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>
        </>
    )
}

export default Sidebar;

