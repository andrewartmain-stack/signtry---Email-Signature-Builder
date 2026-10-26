"use client";

import React, { FC, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    PenLine,
    Layers,
    BarChart3,
    BookOpen,
    CreditCard,
    Settings,
    LogOut,
    ArrowUpRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import Tag from './Tag';
import { SettingsModal } from './SettingsModal';

import avatar from "../../../public/avatar.png"
import logo from '../../../public/logo-full.png'

export type SidebarUserData = { id: string, fullName: string, avatarUrl: string | null, email: string, plan: string };

const navLinks = [
    { href: "/generateSignature", icon: PenLine, label: "Create signature" },
    { href: "/signatures", icon: Layers, label: "My signatures" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/guides", icon: BookOpen, label: "Install guides" },
];

const BILLING_URL = "https://billing.stripe.com/p/login/cNi6oGeER2vo0NU1Ng93y00";

const itemClass = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-action/35";

const Sidebar: FC<{ userData: SidebarUserData | null, fetchAuthenticatedUserData: () => void, onNavigate?: () => void }> = ({ userData, fetchAuthenticatedUserData, onNavigate }) => {

    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

    const pathName = usePathname();

    async function signout() {
        const supabase = await createClient();
        await supabase.auth.signOut();

        window.location.href = '/login'
    }

    return (
        <>
            {userData && <SettingsModal userProfile={{ id: userData.id, fullName: userData.fullName, avatarUrl: userData.avatarUrl, email: userData.email }} isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} fetchAuthenticatedUserData={fetchAuthenticatedUserData} />}

            <aside className="flex h-full w-[260px] flex-col justify-between border-r border-line bg-soft p-4">
                <div className="flex flex-col gap-8">
                    <Link href="/generateSignature" onClick={onNavigate} className="px-3 pt-2">
                        <img src={logo.src} width={116} alt="SignTry" />
                    </Link>

                    <nav aria-label="Main">
                        <ul className="flex flex-col gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathName === link.href;
                                return (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            onClick={onNavigate}
                                            aria-current={isActive ? 'page' : undefined}
                                            className={cn(itemClass, isActive
                                                ? 'bg-card text-ink shadow-[0_1px_2px_rgba(6,27,49,0.08)] ring-1 ring-line'
                                                : 'text-muted-foreground hover:bg-ink/[0.05] hover:text-ink')}
                                        >
                                            <Icon className="size-[18px]" />
                                            <span>{link.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>

                <div className="flex flex-col gap-3">
                    <ul className="flex flex-col gap-0.5">
                        <li>
                            <a href={BILLING_URL} target="_blank" rel="noopener noreferrer" className={cn(itemClass, 'text-muted-foreground hover:bg-ink/[0.05] hover:text-ink')}>
                                <CreditCard className="size-[18px]" />
                                <span className="flex-1">Billing</span>
                                <ArrowUpRight className="size-3.5" />
                            </a>
                        </li>
                        <li>
                            <button onClick={() => setIsSettingsOpen(true)} className={cn(itemClass, 'text-muted-foreground hover:bg-ink/[0.05] hover:text-ink')}>
                                <Settings className="size-[18px]" />
                                Settings
                            </button>
                        </li>
                    </ul>

                    <div className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
                        <img
                            src={userData?.avatarUrl || avatar.src}
                            alt=""
                            className="size-9 shrink-0 rounded-full object-cover"
                        />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="truncate text-sm font-medium text-ink">{userData?.fullName || userData?.email}</span>
                            {userData?.plan && <Tag className="w-fit px-2 py-0.5 text-[11px]">{userData.plan}</Tag>}
                        </div>
                        <button
                            onClick={signout}
                            className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-ink/[0.06] hover:text-ink"
                            aria-label="Log out"
                            title="Log out"
                        >
                            <LogOut className="size-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}

export default Sidebar;
