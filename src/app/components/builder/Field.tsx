import React, { FC, ReactNode, useId } from 'react'

import { Input } from '@/components/ui/input'

// Labelled text input with an optional hint or error underneath
const Field: FC<Omit<React.ComponentProps<typeof Input>, 'id'> & {
    label: ReactNode;
    hint?: ReactNode;
    error?: string;
    optional?: boolean;
}> = ({ label, hint, error, optional, ...inputProps }) => {
    const id = useId();
    const describedBy = error || hint ? `${id}-note` : undefined;

    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-medium text-ink">
                {label}
                {optional && <span className="text-xs font-normal text-muted-foreground">Optional</span>}
            </label>
            <Input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...inputProps} />
            {(error || hint) && (
                <span id={describedBy} className={error ? 'text-[13px] text-destructive' : 'text-[13px] text-muted-foreground'}>
                    {error || hint}
                </span>
            )}
        </div>
    )
}

export default Field

// Group of controls with a small heading, used to break steps into sections
export const Section: FC<{ title: string; description?: ReactNode; children: ReactNode; action?: ReactNode }> = ({ title, description, children, action }) => (
    <section className="flex flex-col gap-4 border-t border-line pt-5 first:border-t-0 first:pt-0">
        <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
                <h3 className="font-sans text-[15px] font-semibold tracking-normal text-ink">{title}</h3>
                {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
            </div>
            {action}
        </div>
        {children}
    </section>
)

export const ControlRow: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-ink">{label}</span>
        {children}
    </div>
)
