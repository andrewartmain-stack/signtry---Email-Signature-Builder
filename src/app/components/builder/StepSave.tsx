"use client"

import React, { FC, RefObject, useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowRight, BookOpen, CheckCircle2, Copy, Loader2, Plus, User, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { fetchSignatureQuota } from '../../services/api'
import { BUILDER_STEPS, BuilderStepId, DesignIssue } from '../../utils/signatureDesign'

export interface SavedResult {
    html: string;
    warnings: string[];
}

const StepSave: FC<{
    issues: DesignIssue[];
    onFix: (step: BuilderStepId) => void;
    onSave: () => void;
    onOpenBulk: () => void;
    onCopy: () => void;
    onCreateAnother: () => void;
    isSaving: boolean;
    saved: SavedResult | null;
    saveButtonRef: RefObject<HTMLButtonElement | null>;
}> = ({ issues, onFix, onSave, onOpenBulk, onCopy, onCreateAnother, isSaving, saved, saveButtonRef }) => {
    const [quota, setQuota] = useState<{ limit: number; remaining: number } | null>(null);

    useEffect(() => {
        fetchSignatureQuota().then(setQuota).catch(() => setQuota(null));
    }, [saved]);

    if (saved) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-start gap-3 rounded-2xl bg-stage-assistant p-6">
                    <CheckCircle2 className="size-8 text-ink" />
                    <h2 className="text-2xl text-ink">Your signature is ready</h2>
                    <p className="text-sm text-ink/80">
                        Copy it, then paste it into your email settings. Clicks on its links show up in Analytics.
                    </p>
                </div>

                {saved.warnings.length > 0 && (
                    <ul className="flex flex-col gap-2 rounded-xl border border-line bg-soft p-4 text-sm text-ink">
                        {saved.warnings.map(warning => (
                            <li key={warning} className="flex gap-2"><AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />{warning}</li>
                        ))}
                    </ul>
                )}

                <div className="flex flex-wrap gap-2">
                    <Button variant="action" size="lg" onClick={onCopy}><Copy /> Copy signature</Button>
                    <Button variant="outline" size="lg" asChild>
                        <Link href="/guides"><BookOpen /> How to install</Link>
                    </Button>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-5 text-sm">
                    <Link href="/signatures" className="inline-flex items-center gap-1 font-medium text-action hover:underline">
                        View my signatures <ArrowRight className="size-3.5" />
                    </Link>
                    <button type="button" onClick={onCreateAnother} className="inline-flex cursor-pointer items-center gap-1 font-medium text-action hover:underline">
                        <Plus className="size-3.5" /> Create another
                    </button>
                </div>
            </div>
        )
    }

    const isReady = issues.length === 0;
    const noRoomLeft = quota !== null && quota.remaining <= 0;

    return (
        <div className="flex flex-col gap-6">
            {!isReady && (
                <div className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/[0.04] p-4">
                    <span className="text-sm font-medium text-ink">Fix {issues.length === 1 ? 'this' : 'these'} before saving</span>
                    <ul className="flex flex-col gap-2">
                        {issues.map(issue => (
                            <li key={issue.field} className="flex items-center justify-between gap-3 text-sm">
                                <span className="flex items-center gap-2 text-ink"><AlertCircle className="size-4 shrink-0 text-destructive" />{issue.message}</span>
                                <Button type="button" variant="outline" size="sm" onClick={() => onFix(issue.step)}>
                                    Go to {BUILDER_STEPS.find(step => step.id === issue.step)?.label}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-5">
                    <span className="flex size-10 items-center justify-center rounded-full bg-cream"><User className="size-5 text-ink" /></span>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg text-ink">Just for me</h3>
                        <p className="text-[13px] text-muted-foreground">Save this signature to your account, ready to copy.</p>
                    </div>
                    <Button
                        ref={saveButtonRef}
                        variant="action"
                        className="mt-auto"
                        onClick={onSave}
                        disabled={!isReady || isSaving || noRoomLeft}
                    >
                        {isSaving ? <><Loader2 className="animate-spin" /> Saving...</> : 'Save signature'}
                    </Button>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-5">
                    <span className="flex size-10 items-center justify-center rounded-full bg-cream"><Users className="size-5 text-ink" /></span>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg text-ink">For my team</h3>
                        <p className="text-[13px] text-muted-foreground">Upload a CSV and get this design for every person, with their own details.</p>
                    </div>
                    <Button variant="outline" className="mt-auto" onClick={onOpenBulk} disabled={!isReady || isSaving || noRoomLeft}>
                        Generate from CSV
                    </Button>
                </div>
            </div>

            {quota && (
                <p className="text-[13px] text-muted-foreground">
                    {noRoomLeft
                        ? <>You&apos;ve used all {quota.limit} signatures on your plan. Delete some in <Link href="/signatures" className="text-action hover:underline">My signatures</Link> or upgrade.</>
                        : <>{quota.remaining} of {quota.limit} signatures left on your plan.</>}
                </p>
            )}
        </div>
    )
}

export default StepSave
