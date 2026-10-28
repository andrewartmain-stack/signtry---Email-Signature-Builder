"use client"

import React, { FC, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

// Renders a signature at its natural email size and scales it down to fit,
// so thumbnails look exactly like the real thing.
// - Without maxWidth it fills the container width (and scales to fit it).
// - With maxWidth it is only as wide as the signature itself, scaled down
//   only when the signature is wider than maxWidth.
const ScaledSignature: FC<{ html: string; className?: string; maxScale?: number; maxWidth?: number }> = ({ html, className, maxScale = 1, maxWidth }) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ scale: 1, width: 0, height: 0 });

    useLayoutEffect(() => {
        const outer = outerRef.current;
        const inner = innerRef.current;
        if (!outer || !inner) return;

        const measure = () => {
            const naturalWidth = inner.scrollWidth || 1;
            const available = maxWidth ?? outer.clientWidth;
            const scale = Math.min(maxScale, available / naturalWidth);
            setSize({ scale, width: naturalWidth * scale, height: inner.scrollHeight * scale });
        };

        measure();
        // Images load after the first paint and change the signature size
        const observer = new ResizeObserver(measure);
        if (maxWidth === undefined) observer.observe(outer);
        observer.observe(inner);
        return () => observer.disconnect();
    }, [html, maxScale, maxWidth]);

    return (
        <div
            ref={outerRef}
            className={cn('relative overflow-hidden', maxWidth === undefined && 'w-full', className)}
            style={{ height: size.height || undefined, width: maxWidth !== undefined ? size.width || undefined : undefined }}
        >
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
