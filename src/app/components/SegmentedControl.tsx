import React from 'react'

import { cn } from '@/lib/utils'

export interface SegmentOption<T extends string> {
    value: T;
    label: React.ReactNode;
    title?: string;
}

// Pick one value from a short list (sizes, styles, alignment...)
function SegmentedControl<T extends string>({ options, value, onChange, label, className }: {
    options: SegmentOption<T>[];
    value: T;
    onChange: (value: T) => void;
    label: string;
    className?: string;
}) {
    return (
        <div role="radiogroup" aria-label={label} className={cn('inline-flex flex-wrap gap-1 rounded-full bg-ink/[0.05] p-1', className)}>
            {options.map(option => {
                const isActive = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        title={option.title}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'h-8 min-w-9 cursor-pointer rounded-full px-3 text-[13px] font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-action/35',
                            isActive
                                ? 'bg-card text-ink shadow-[0_1px_2px_rgba(6,27,49,0.14)]'
                                : 'text-muted-foreground hover:text-ink'
                        )}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}

export default SegmentedControl
