"use client"

import React, { FC, useState } from 'react'
import { Monitor, Smartphone } from 'lucide-react'

import SegmentedControl from './SegmentedControl'
import Signature from './Signature'

import { cn } from '@/lib/utils'

// The signature inside a mock email, at desktop or phone width, so users
// see it the way recipients will.
const EmailPreview: FC<{ html: string; senderName?: string }> = ({ html, senderName }) => {
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="size-2.5 rounded-full bg-ink/10" />
                    <span className="size-2.5 rounded-full bg-ink/10" />
                    <span className="size-2.5 rounded-full bg-ink/10" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Live preview</span>
                <SegmentedControl
                    label="Preview width"
                    value={device}
                    onChange={setDevice}
                    className="p-0.5"
                    options={[
                        { value: 'desktop', label: <Monitor className="size-3.5" />, title: 'Desktop' },
                        { value: 'mobile', label: <Smartphone className="size-3.5" />, title: 'Phone' },
                    ]}
                />
            </div>

            <div className="flex justify-center bg-white">
                <div
                    className={cn(
                        'w-full overflow-x-auto bg-white transition-[max-width] duration-300',
                        device === 'mobile' ? 'max-w-[375px] border-x border-line' : 'max-w-full'
                    )}
                >
                    <div className="flex flex-col gap-1 border-b border-line px-5 py-3 text-[13px]">
                        <div className="flex gap-2"><span className="w-14 text-muted-foreground">From</span><span className="truncate text-ink">{senderName || 'You'}</span></div>
                        <div className="flex gap-2"><span className="w-14 text-muted-foreground">Subject</span><span className="truncate text-ink">Quick follow-up</span></div>
                    </div>
                    <div className="flex flex-col gap-5 px-5 py-5 text-sm leading-relaxed text-[#3c4043]">
                        <p>
                            Hi Alex,<br /><br />
                            Thanks for your time today. I&apos;ve attached the notes from our call. Let me know if you have any questions.<br /><br />
                            Best regards,
                        </p>
                        <Signature html={html} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmailPreview
