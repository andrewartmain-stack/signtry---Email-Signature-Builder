"use client"

import React, { useTransition } from 'react'
import { ArrowUpRight, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '../../components/Toast'
import { openBillingPortalAction } from '../../utils/stripe/billingActions'

// Stripe Customer Portal: card, invoices and cancellation
export default function BillingPortalButton() {
    const toast = useToast();
    const [isPending, startTransition] = useTransition();

    const open = () => startTransition(async () => {
        const result = await openBillingPortalAction();
        if (result.url) window.location.href = result.url;
        else toast('error', result.error ?? 'Could not open billing. Please try again.');
    });

    return (
        <Button variant="outline" onClick={open} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
            Manage billing
        </Button>
    )
}
