import React from 'react'

import PageHeader from '../../components/PageHeader'
import PlanPicker from '../../components/PlanPicker'
import BillingPortalButton from './BillingPortalButton'
import { Progress } from '@/components/ui/progress'

import { requireSubscribedSession } from '../../utils/supabase/session'
import { getSignatureQuota } from '../../utils/signatureLimits'
import { getBillingSummary } from '../../utils/stripe/plans'
import { formatUsd, PLAN_SIZES, planPrice, signaturesLabel } from '../../utils/plans'

const formatDate = (seconds: number) =>
    new Date(seconds * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ size?: string }> }) {
    const [{ supabase, user, profile }, { size }] = await Promise.all([requireSubscribedSession(), searchParams]);

    const [quota, summary] = await Promise.all([
        getSignatureQuota(supabase, user.id),
        getBillingSummary(user.id, user.email, profile.price_id),
    ]);

    const plan = summary?.plan;
    const planSize = plan?.signatures ? PLAN_SIZES.find(item => item.signatures === plan.signatures) : undefined;
    const price = planSize && plan?.interval ? planPrice(planSize, plan.interval) : null;
    const usage = quota.limit > 0 ? Math.min(100, (quota.used / quota.limit) * 100) : 0;
    // ?size=25 preselects a size, e.g. from an "upgrade" prompt
    const requested = Number(size);

    return (
        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
            <PageHeader
                title="Billing"
                description="Every feature is on every plan. Change the number of signatures any time."
                actions={summary?.hasSubscription ? <BillingPortalButton /> : undefined}
            />

            <section className="grid grid-cols-1 gap-4 rounded-3xl border border-line bg-card p-5 md:grid-cols-[1.2fr_1fr] md:p-6">
                <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-medium text-muted-foreground">Current plan</span>
                    <span className="text-[22px] font-medium text-ink">{plan?.label ?? 'No active plan'}</span>
                    <p className="text-sm text-muted-foreground">
                        {price && plan?.interval
                            ? `${formatUsd(price.charged)} ${plan.interval === 'year' ? 'per year' : 'per month'}`
                            : plan?.isLegacy ? 'Legacy plan. Pick a size below to move to the new pricing.' : null}
                        {summary?.endsAt
                            ? ` · Cancelled, access until ${formatDate(summary.endsAt)}`
                            : summary?.renewsAt ? ` · Renews ${formatDate(summary.renewsAt)}` : null}
                    </p>
                    {summary?.status === 'past_due' && (
                        <p className="text-sm text-destructive">Your last payment failed. Update your card in Manage billing to keep your plan.</p>
                    )}
                </div>
                <div className="flex flex-col justify-center gap-2">
                    <div className="flex items-baseline justify-between text-sm">
                        <span className="text-muted-foreground">Signatures used</span>
                        <span className="font-medium text-ink">{quota.used} of {plan?.label === 'Admin' ? 'unlimited' : quota.limit}</span>
                    </div>
                    <Progress value={usage} aria-label="Signatures used" />
                    {quota.limit > 0 && quota.remaining === 0 && plan?.label !== 'Admin' && (
                        <span className="text-[13px] text-muted-foreground">You&apos;ve used all {signaturesLabel(quota.limit)}. Pick a bigger size to add more.</span>
                    )}
                </div>
            </section>

            {summary?.hasSubscription ? (
                <PlanPicker
                    mode="change"
                    current={{ signatures: plan?.signatures ?? null, interval: plan?.interval ?? null }}
                    used={quota.used}
                    initialSignatures={requested || undefined}
                />
            ) : plan?.label !== 'Admin' && (
                <p className="text-sm text-muted-foreground">
                    Your plan isn&apos;t a subscription, so its size can&apos;t be changed here. Contact <a className="text-action hover:underline" href="mailto:support@signtry.com">support@signtry.com</a> to move to a bigger plan.
                </p>
            )}

            {summary?.hasSubscription && (
                <p className="text-[13px] text-muted-foreground">
                    Card, invoices and cancellation are in <b className="font-medium text-ink">Manage billing</b>. If you cancel, you keep access until the end of the period you&apos;ve paid for. Prices are in USD and exclude tax.
                </p>
            )}
        </div>
    )
}
