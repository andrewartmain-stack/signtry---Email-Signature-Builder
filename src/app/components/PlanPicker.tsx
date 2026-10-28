"use client"

import React, { FC, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import Tag from './Tag'
import SegmentedControl from './SegmentedControl'
import { useToast } from './Toast'

import {
    BillingInterval, CUSTOM_PLAN_MAILTO, CUSTOM_PLAN_SIGNATURES, PLAN_FEATURES, PLAN_SIZES, YEARLY_SAVINGS_LABEL,
    formatUsd, planPrice, signaturesLabel,
} from '../utils/plans'
import { changePlanAction, startCheckoutAction } from '../utils/stripe/billingActions'

type Selection = number | 'custom';

// Signature-quota pricing: pick a size and a billing period.
// - subscribe: new customers go to Stripe Checkout
// - change: existing subscribers swap their plan (blocked below current usage)
const PlanPicker: FC<{
    mode: 'subscribe' | 'change';
    current?: { signatures: number | null; interval: BillingInterval | null };
    used?: number;
    initialSignatures?: number;
}> = ({ mode, current, used = 0, initialSignatures }) => {
    const router = useRouter();
    const toast = useToast();
    const [interval, setBillingInterval] = useState<BillingInterval>(current?.interval ?? 'year');
    const [selected, setSelected] = useState<Selection>(() => {
        const preferred = initialSignatures ?? current?.signatures;
        return PLAN_SIZES.some(size => size.signatures === preferred) ? preferred! : 10;
    });
    const [error, setError] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const size = selected === 'custom' ? null : PLAN_SIZES.find(item => item.signatures === selected)!;
    const price = size ? planPrice(size, interval) : null;
    const isCurrent = mode === 'change' && size !== null && current?.signatures === size.signatures && current.interval === interval;
    const tooSmall = mode === 'change' && size !== null && used > size.signatures;

    const select = (value: Selection) => {
        setSelected(value);
        setError('');
    };

    const subscribe = () => {
        if (!size) return;
        setError('');
        startTransition(async () => {
            const result = await startCheckoutAction(size.signatures, interval);
            if (result.url) window.location.href = result.url;
            else setError(result.error ?? 'Something went wrong. Please try again.');
        });
    };

    const changePlan = () => {
        if (!size) return;
        startTransition(async () => {
            const result = await changePlanAction(size.signatures, interval);
            setConfirmOpen(false);
            if (result.error) {
                setError(result.error);
                return;
            }
            toast('success', `You're now on ${signaturesLabel(size.signatures)}, billed ${interval === 'year' ? 'yearly' : 'monthly'}.`);
            router.refresh();
        });
    };

    const ctaLabel = !size
        ? 'Contact us'
        : isCurrent
            ? 'Your current plan'
            : mode === 'change' ? `Switch to ${signaturesLabel(size.signatures)}` : `Get ${signaturesLabel(size.signatures)}`;

    return (
        <div className="flex flex-col gap-6 rounded-3xl border border-line bg-card p-5 shadow-[0_12px_32px_-16px_rgba(6,27,49,0.18)] md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[22px] text-ink md:text-[26px]">How many signatures do you need?</h2>
                <SegmentedControl<BillingInterval>
                    label="Billing period"
                    value={interval}
                    onChange={(value) => { setBillingInterval(value); setError(''); }}
                    className="w-fit shrink-0"
                    options={[
                        { value: 'year', label: <span className="flex items-center gap-2">Yearly <Tag className="px-2 py-0.5 text-[11px]">{YEARLY_SAVINGS_LABEL}</Tag></span> },
                        { value: 'month', label: 'Monthly' },
                    ]}
                />
            </div>

            <div className="grid grid-cols-4 gap-2 md:grid-cols-8" role="radiogroup" aria-label="Number of signatures">
                {[...PLAN_SIZES.map(item => item.signatures as Selection), 'custom' as const].map(value => {
                    const isActive = value === selected;
                    const isCurrentSize = mode === 'change' && value === current?.signatures;
                    return (
                        <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={isActive}
                            onClick={() => select(value)}
                            className={cn(
                                'relative flex cursor-pointer flex-col items-center gap-0.5 rounded-2xl border px-1 py-3 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-action/35 md:py-5',
                                isActive ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink hover:border-ink/25'
                            )}
                        >
                            <span className="text-lg font-medium md:text-[22px]">{value === 'custom' ? `${CUSTOM_PLAN_SIGNATURES}+` : value}</span>
                            <span className={cn('text-[11px] md:text-xs', isActive ? 'text-white/70' : 'text-muted-foreground')}>
                                {value === 1 ? 'signature' : 'signatures'}
                            </span>
                            {isCurrentSize && (
                                <span className="absolute -top-2 rounded-full bg-lime px-1.5 py-px text-[10px] font-medium text-ink">Current</span>
                            )}
                        </button>
                    )
                })}
            </div>

            <div className="h-px bg-line" />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="flex flex-col items-start gap-3">
                    {size && price ? (
                        <>
                            <div className="flex items-baseline gap-2">
                                <span className="font-display text-[56px] leading-none font-medium tracking-[-0.03em] text-ink md:text-[72px]">{formatUsd(price.perMonth)}</span>
                                <span className="text-lg text-muted-foreground">/ month</span>
                            </div>
                            <p className="text-[15px] text-muted-foreground">
                                <b className="font-semibold text-action">{formatUsd(price.perSignature)}</b> per signature ·{' '}
                                {interval === 'year' ? `${formatUsd(price.charged)} billed yearly` : 'billed monthly'}
                            </p>
                            {interval === 'year'
                                ? <Tag>You save {formatUsd(price.yearlySaving)} a year with yearly billing</Tag>
                                : <button type="button" onClick={() => setBillingInterval('year')} className="cursor-pointer text-[13px] text-muted-foreground underline underline-offset-4 hover:text-ink">Save {formatUsd(price.yearlySaving)} a year with yearly billing</button>}
                        </>
                    ) : (
                        <>
                            <span className="font-display text-[44px] leading-none font-medium tracking-[-0.03em] text-ink md:text-[56px]">Custom</span>
                            <p className="text-[15px] text-muted-foreground">
                                Volume pricing for {CUSTOM_PLAN_SIGNATURES}+ signatures, invoice billing, help importing your team and priority support.
                            </p>
                        </>
                    )}

                    <div className="mt-3 flex flex-col items-start gap-2">
                        {size ? (
                            <Button
                                size="lg"
                                disabled={isPending || isCurrent || tooSmall}
                                onClick={mode === 'change' ? () => { setError(''); setConfirmOpen(true); } : subscribe}
                            >
                                {isPending && mode === 'subscribe' && <Loader2 className="size-4 animate-spin" />}
                                {ctaLabel}
                            </Button>
                        ) : (
                            <Button size="lg" asChild><a href={CUSTOM_PLAN_MAILTO}>Contact us</a></Button>
                        )}
                        {tooSmall && size && (
                            <p className="text-[13px] text-muted-foreground">
                                You have {signaturesLabel(used)}. Delete {used - size.signatures} to switch to this size.
                            </p>
                        )}
                        {mode === 'subscribe' && size && <p className="text-[13px] text-muted-foreground">Cancel any time. Prices exclude tax.</p>}
                        {error && <p role="alert" className="text-[13px] text-destructive">{error}</p>}
                    </div>
                </div>

                <ul className="flex flex-col gap-3">
                    {PLAN_FEATURES.map(feature => (
                        <li key={feature} className="flex items-start gap-3 text-[15px] text-ink">
                            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/25 text-action">
                                <Check className="size-3" strokeWidth={3} />
                            </span>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            {mode === 'change' && size && price && (
                <Dialog open={confirmOpen} onOpenChange={(open) => !isPending && setConfirmOpen(open)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Switch to {signaturesLabel(size.signatures)}?</DialogTitle>
                            <DialogDescription>
                                Your plan changes now to {formatUsd(price.charged)} {interval === 'year' ? 'per year' : 'per month'}.
                                The difference for the rest of this billing period is prorated and added to your next invoice.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isPending}>Cancel</Button>
                            <Button onClick={changePlan} disabled={isPending}>
                                {isPending && <Loader2 className="size-4 animate-spin" />}
                                Switch plan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default PlanPicker
