"use client"

import React, { FC, useId, useRef } from 'react'
import { ImagePlus, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Thumbnail + "Upload" button. Images are resized for email when the
// signature is saved, so any reasonably sized PNG/JPG/WebP works.
const ImagePicker: FC<{
    label: string;
    hint?: string;
    src: string;
    onFile: (file: File) => void;
    onReset?: () => void;
    previewClassName?: string;
}> = ({ label, hint, src, onFile, onReset, previewClassName }) => {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex items-center gap-4">
            <div className={cn('flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-cream', previewClassName)}>
                {src
                    ? <img src={src} alt="" className="h-full w-full object-contain" />
                    : <ImagePlus className="size-5 text-muted-foreground" />}
            </div>
            <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor={inputId} className="text-sm font-medium text-ink">{label}</label>
                {hint && <span className="-mt-1.5 text-[13px] text-muted-foreground">{hint}</span>}
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                        <ImagePlus /> Upload
                    </Button>
                    {onReset && (
                        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
                            <RotateCcw /> Reset
                        </Button>
                    )}
                </div>
                <input
                    ref={inputRef}
                    id={inputId}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onFile(file);
                        // Allow picking the same file again
                        e.target.value = '';
                    }}
                />
            </div>
        </div>
    )
}

export default ImagePicker
