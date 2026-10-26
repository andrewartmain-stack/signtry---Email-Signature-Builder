import React, { FC, ReactNode } from 'react'

import Tag from './Tag'

// Top of every dashboard page: optional section tag, title, one-line
// description and page-level actions on the right.
const PageHeader: FC<{
    tag?: string;
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
}> = ({ tag, title, description, actions }) => {
    return (
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-start gap-3">
                {tag && <Tag>{tag}</Tag>}
                <h1 className="text-[28px] md:text-[34px] text-ink">{title}</h1>
                {description && <p className="max-w-2xl text-[15px] text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
    )
}

export default PageHeader
