import React, { FC, ReactNode } from 'react'

import { cn } from '@/lib/utils'

// On/off row: title, optional hint, and a switch that turns Action blue when on
const Switch: FC<{
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label: ReactNode;
    description?: ReactNode;
    className?: string;
}> = ({ checked, onCheckedChange, label, description, className }) => {
    return (
        <label className={cn('flex cursor-pointer items-start justify-between gap-4', className)}>
            <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-ink">{label}</span>
                {description && <span className="text-[13px] text-muted-foreground">{description}</span>}
            </span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onCheckedChange(!checked)}
                className={cn(
                    'relative mt-0.5 h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-action/35',
                    checked ? 'bg-action' : 'bg-ink/15'
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(6,27,49,0.3)] transition-transform',
                        checked && 'translate-x-4'
                    )}
                />
            </button>
        </label>
    )
}

export default Switch
