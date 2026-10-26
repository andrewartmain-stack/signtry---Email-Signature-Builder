"use client"

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    Facebook,
    Instagram,
    Linkedin,
    Globe,
    Music,
    Twitter,
    MessageCircle,
    Youtube,
    Mail,
    Github,
    RectangleHorizontal,
    Image as ImageIcon,
    MousePointerClick,
    Phone,
    Pencil,
    Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import PageHeader from '../../components/PageHeader';
import ScaledSignature from '../../components/ScaledSignature';
import { useToast } from '../../components/Toast';

import { getSignatureTextLines } from '../../utils/copySignature';

import { SavedSignatureDataInterface, ClickAnalyticsDataInterface, LinkDataInterface } from '../../types';

const LINK_LABELS: Record<string, string> = {
    email: 'Email', phone: 'Phone', photo: 'Photo', banner: 'Banner',
    button_1: 'Button 1', button_2: 'Button 2',
    linkedin: 'LinkedIn', x: 'X (Twitter)', twitter: 'X (Twitter)', facebook: 'Facebook', instagram: 'Instagram',
    whatsapp: 'WhatsApp', youtube: 'YouTube', tiktok: 'TikTok', github: 'GitHub', website: 'Website', site: 'Website link',
};

function getLinkIcon(linkName: string) {
    const className = "size-4 text-muted-foreground";
    switch (linkName.toLowerCase()) {
        case "email": return <Mail className={className} />;
        case "phone": return <Phone className={className} />;
        case "github": return <Github className={className} />;
        case "tiktok": return <Music className={className} />;
        case "facebook": return <Facebook className={className} />;
        case "instagram": return <Instagram className={className} />;
        case "x":
        case "twitter": return <Twitter className={className} />;
        case "linkedin": return <Linkedin className={className} />;
        case "whatsapp": return <MessageCircle className={className} />;
        case "youtube": return <Youtube className={className} />;
        case "banner": return <RectangleHorizontal className={className} />;
        case "photo": return <ImageIcon className={className} />;
        case "button_1":
        case "button_2": return <MousePointerClick className={className} />;
        default: return <Globe className={className} />;
    }
}

function isSameUtcMonth(date: Date, year: number, month: number) {
    return date.getUTCFullYear() === year && date.getUTCMonth() === month;
}

// Single series, so one color and no legend; the card title names it
const chartConfig = {
    clicks: { label: "Clicks", color: "var(--action)" },
} satisfies ChartConfig

const ClicksChart = ({ data, dataKey }: { data: { clicks: number }[], dataKey: string }) => (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
        <BarChart accessibilityLayer data={data} margin={{ top: 8, right: 0, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis dataKey={dataKey} tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
            <ChartTooltip cursor={{ fill: 'rgba(6,27,49,0.04)' }} content={<ChartTooltipContent />} />
            <Bar dataKey="clicks" fill="var(--color-clicks)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
        </BarChart>
    </ChartContainer>
)

export default function Analytics({ savedSignatures, initialSignatureId, initialAnalyticsData, initialLinksData }: { savedSignatures: SavedSignatureDataInterface[], initialSignatureId: number | null, initialAnalyticsData: ClickAnalyticsDataInterface[], initialLinksData: LinkDataInterface[] }) {

    const [signatures, setSignatures] = useState<SavedSignatureDataInterface[]>(savedSignatures)
    const [clicks, setClicks] = useState(initialAnalyticsData);
    const [linksData, setLinksData] = useState(initialLinksData)
    const [selectedSignatureId, setSelectedSignatureId] = useState<number | null>(initialSignatureId);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [goalDraft, setGoalDraft] = useState('');
    const [isSavingGoal, setIsSavingGoal] = useState(false);

    const toast = useToast();

    const selectedSignature = signatures.find(signature => signature.id === selectedSignatureId) ?? null;
    const monthlyGoal = Number(selectedSignature?.monthly_goal) || 0;

    const signatureLabels = useMemo(
        () => new Map(signatures.map(signature => {
            const lines = getSignatureTextLines(signature.html);
            return [signature.id, [lines[0], lines[1]].filter(Boolean).join(' · ') || `Signature #${signature.id}`];
        })),
        [signatures]
    );

    async function selectSignature(id: number) {
        setSelectedSignatureId(id);
        setIsEditingGoal(false);
        setIsLoading(true);

        try {
            const [responseClicks, responseLinks] = await Promise.all([
                fetch(`/api/get-signature-clicks-analytics?id=${id}`),
                fetch(`/api/get-signature-links-analytics?id=${id}`),
            ]);

            if (!responseClicks.ok || !responseLinks.ok) throw new Error('Could not load analytics');

            setClicks((await responseClicks.json()).data ?? []);
            setLinksData((await responseLinks.json()).data ?? []);
        } catch (error) {
            toast('error', error instanceof Error ? error.message : 'Could not load analytics');
        } finally {
            setIsLoading(false);
        }
    }

    const stats = useMemo(() => {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth();
        const lastMonth = month === 0 ? 11 : month - 1;
        const lastMonthYear = month === 0 ? year - 1 : year;

        const dates = clicks.map(click => new Date(click.clicked_at));
        const thisMonth = dates.filter(date => isSameUtcMonth(date, year, month)).length;
        const previousMonth = dates.filter(date => isSameUtcMonth(date, lastMonthYear, lastMonth)).length;

        const monthly = Array.from({ length: 6 }, (_, i) => {
            const start = new Date(Date.UTC(year, month - (5 - i), 1));
            return {
                month: start.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
                clicks: dates.filter(date => isSameUtcMonth(date, start.getUTCFullYear(), start.getUTCMonth())).length,
            };
        });

        const daily = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(now);
            day.setUTCDate(now.getUTCDate() - (6 - i));
            return {
                day: day.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
                clicks: dates.filter(date =>
                    isSameUtcMonth(date, day.getUTCFullYear(), day.getUTCMonth()) && date.getUTCDate() === day.getUTCDate()
                ).length,
            };
        });

        let change = '';
        if (previousMonth > 0) {
            const difference = ((thisMonth - previousMonth) / previousMonth) * 100;
            change = `${difference > 0 ? '+' : difference < 0 ? '−' : ''}${Math.abs(difference).toFixed(0)}% vs last month`;
        } else if (thisMonth > 0) {
            change = 'No clicks last month';
        }

        const clicksByLink = new Map<string, number>();
        clicks.forEach(click => clicksByLink.set(click.signature_link_id, (clicksByLink.get(click.signature_link_id) ?? 0) + 1));

        return { thisMonth, previousMonth, total: clicks.length, monthly, daily, change, clicksByLink };
    }, [clicks]);

    const links = useMemo(
        () => linksData
            .map(link => ({ ...link, clicks: stats.clicksByLink.get(link.id) ?? 0 }))
            .sort((a, b) => b.clicks - a.clicks),
        [linksData, stats.clicksByLink]
    );
    const maxLinkClicks = Math.max(1, ...links.map(link => link.clicks));

    // A monthly goal is measured against this month's clicks, not all-time clicks
    const progressValue = monthlyGoal > 0 ? Math.min(Math.round(stats.thisMonth / monthlyGoal * 100), 100) : 0;

    async function handleSaveGoal() {
        const goal = Math.round(Number(goalDraft));
        if (!selectedSignatureId || !Number.isFinite(goal) || goal <= 0) {
            toast('error', 'Enter a goal of at least 1 click');
            return;
        }

        setIsSavingGoal(true);
        try {
            const response = await fetch(`/api/update-signature-monthly-goal?id=${selectedSignatureId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goal }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || 'Could not update goal');

            setSignatures(current => current.map(signature =>
                signature.id === selectedSignatureId ? { ...signature, monthly_goal: String(result.data) } : signature
            ));
            setIsEditingGoal(false);
            toast('success', 'Monthly goal updated');
        } catch (error) {
            toast('error', error instanceof Error ? error.message : 'Could not update goal');
        } finally {
            setIsSavingGoal(false);
        }
    }

    if (signatures.length === 0) {
        return (
            <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
                <PageHeader tag="Analytics" title="Link clicks" description="See which links in your signature people click." />
                <div className="flex flex-col items-center gap-4 rounded-3xl bg-stage-recaps px-6 py-16 text-center">
                    <h2 className="text-2xl text-ink">Nothing to measure yet</h2>
                    <p className="max-w-sm text-sm text-ink/75">Every link in a saved signature is tracked. Save your first signature to start seeing clicks.</p>
                    <Button size="lg" asChild>
                        <Link href="/generateSignature"><Plus /> Create a signature</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
            <PageHeader
                tag="Analytics"
                title="Link clicks"
                description="Clicks on the links in your signature, counted in UTC."
                actions={
                    <Select value={selectedSignatureId ? String(selectedSignatureId) : undefined} onValueChange={(value) => selectSignature(Number(value))}>
                        <SelectTrigger className="w-full max-w-[320px] md:w-[320px]" aria-label="Signature">
                            <SelectValue placeholder="Choose a signature" />
                        </SelectTrigger>
                        <SelectContent>
                            {signatures.map(signature => (
                                <SelectItem key={signature.id} value={String(signature.id)}>
                                    {signatureLabels.get(signature.id)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            />

            <div className={`flex flex-col gap-6 transition-opacity ${isLoading ? 'pointer-events-none opacity-50' : ''}`} aria-busy={isLoading}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-5">
                        <span className="text-[13px] font-medium text-muted-foreground">This month</span>
                        <span className="font-display text-4xl font-medium tracking-[-0.03em] text-ink">{stats.thisMonth}</span>
                        <span className="text-[13px] text-muted-foreground">{stats.change || 'No clicks yet'}</span>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-5">
                        <span className="text-[13px] font-medium text-muted-foreground">Last month</span>
                        <span className="font-display text-4xl font-medium tracking-[-0.03em] text-ink">{stats.previousMonth}</span>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-5">
                        <span className="text-[13px] font-medium text-muted-foreground">All time</span>
                        <span className="font-display text-4xl font-medium tracking-[-0.03em] text-ink">{stats.total}</span>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-muted-foreground">Monthly goal</span>
                            {!isEditingGoal && (
                                <Button variant="ghost" size="icon-sm" className="-my-1 -mr-2" aria-label="Edit goal" title="Edit goal"
                                    onClick={() => { setGoalDraft(monthlyGoal ? String(monthlyGoal) : ''); setIsEditingGoal(true); }}>
                                    <Pencil />
                                </Button>
                            )}
                        </div>
                        {isEditingGoal ? (
                            <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); handleSaveGoal(); }}>
                                <Input type="number" min={1} step={1} autoFocus value={goalDraft} onChange={(e) => setGoalDraft(e.target.value)} aria-label="Clicks per month" placeholder="Clicks per month" />
                                <div className="flex gap-2">
                                    <Button type="submit" size="sm" disabled={isSavingGoal}>Save</Button>
                                    <Button type="button" size="sm" variant="ghost" onClick={() => setIsEditingGoal(false)}>Cancel</Button>
                                </div>
                            </form>
                        ) : monthlyGoal > 0 ? (
                            <>
                                <span className="font-display text-4xl font-medium tracking-[-0.03em] text-ink">
                                    {progressValue}<span className="text-xl">%</span>
                                </span>
                                <Progress value={progressValue} className="h-1.5" />
                                <span className="text-[13px] text-muted-foreground">{stats.thisMonth} of {monthlyGoal} clicks</span>
                            </>
                        ) : (
                            <span className="text-[13px] text-muted-foreground">Set a target number of clicks for this month.</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-5">
                        <h2 className="font-sans text-[15px] font-semibold tracking-normal">Clicks per month</h2>
                        <ClicksChart data={stats.monthly} dataKey="month" />
                    </div>
                    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-5">
                        <h2 className="font-sans text-[15px] font-semibold tracking-normal">Clicks in the last 7 days</h2>
                        <ClicksChart data={stats.daily} dataKey="day" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-5">
                        <h2 className="font-sans text-[15px] font-semibold tracking-normal">Clicks by link</h2>
                        {links.length > 0 ? (
                            <ul className="flex flex-col">
                                {links.map(link => (
                                    <li key={link.id} className="flex items-center gap-3 border-t border-line py-3 first:border-t-0 first:pt-0">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cream">{getLinkIcon(link.link_key)}</span>
                                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                            <div className="flex items-baseline justify-between gap-3">
                                                <span className="truncate text-sm font-medium text-ink">{LINK_LABELS[link.link_key.toLowerCase()] ?? link.link_key}</span>
                                                <span className="text-sm font-medium tabular-nums text-ink">{link.clicks}</span>
                                            </div>
                                            <div className="h-1 overflow-hidden rounded-full bg-ink/[0.06]">
                                                <div className="h-full rounded-full bg-action" style={{ width: `${(link.clicks / maxLinkClicks) * 100}%` }} />
                                            </div>
                                            <span className="truncate text-xs text-muted-foreground" title={link.target_url}>{link.target_url}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">This signature has no links.</p>
                        )}
                    </div>

                    {selectedSignature && (
                        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-5">
                            <h2 className="font-sans text-[15px] font-semibold tracking-normal">Signature</h2>
                            <div className="bg-white">
                                <ScaledSignature html={selectedSignature.html} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
