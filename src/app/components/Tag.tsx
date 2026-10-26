import React, { FC, ReactNode } from 'react'

import { cn } from '@/lib/utils'

// Section tag pill: Lime with Ink text (DESIGN.md)
const Tag: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full bg-lime px-2.5 py-1 text-xs font-medium text-ink', className)}>
            {children}
        </span>
    )
}

export default Tag
