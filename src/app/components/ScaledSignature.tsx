"use client"

import React, { FC, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

// Renders a signature at its natural email size and scales it down to fit
// the container width, so thumbnails look exactly like the real thing.
const ScaledSignature: FC<{ html: string; className?: string; maxScale?: number }> = ({ html, className, maxScale = 1 }) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ scale: 1, height: 0 });

    useLayoutEffect(() => {
        const outer = outerRef.current;
        const inner = innerRef.current;
        if (!outer || !inner) return;

        const measure = () => {
            const naturalWidth = inner.scrollWidth || 1;
            const scale = Math.min(maxScale, outer.clientWidth / naturalWidth);
            setSize({ scale, height: inner.scrollHeight * scale });
        };

        measure();
        // Images load after the first paint and change the signature size
        const observer = new ResizeObserver(measure);
        observer.observe(outer);
        observer.observe(inner);
        return () => observer.disconnect();
    }, [html, maxScale]);

    return (
        <div ref={outerRef} className={cn('relative w-full overflow-hidden', className)} style={{ height: size.height || undefined }}>
            <div
                ref={innerRef}
                className="pointer-events-none absolute top-0 left-0 w-max origin-top-left"
                style={{ transform: `scale(${size.scale})` }}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    )
}

export default React.memo(ScaledSignature)
