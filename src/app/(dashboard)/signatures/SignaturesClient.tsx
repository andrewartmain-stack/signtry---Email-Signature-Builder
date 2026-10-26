"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { BarChart3, Code2, Copy, Loader2, Plus, Search, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import PageHeader from '../../components/PageHeader';
import ScaledSignature from '../../components/ScaledSignature';
import { useToast } from '../../components/Toast';

import { copySignature, copySignatureHtmlCode, getSignatureTextLines } from '../../utils/copySignature';

import { deleteSignature } from '../../services/api';

import { SavedSignatureDataInterface } from '../../types';

export default function Signatures({ initialSignatures }: { initialSignatures: SavedSignatureDataInterface[] }) {
    const [signatures, setSignatures] = useState<SavedSignatureDataInterface[]>(initialSignatures);
    const [pendingDelete, setPendingDelete] = useState<SavedSignatureDataInterface | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [search, setSearch] = useState('');

    const toast = useToast();

    // Card titles and search both use the visible text: name, title, email...
    const signatureTexts = useMemo(
        () => new Map(signatures.map(signature => {
            const lines = getSignatureTextLines(signature.html);
            return [signature.id, { title: lines[0] ?? 'Signature', subtitle: lines[1] ?? '', search: lines.join(' ').toLowerCase() }];
        })),
        [signatures]
    );

    const query = search.trim().toLowerCase();
    const visibleSignatures = query
        ? signatures.filter(signature => signatureTexts.get(signature.id)?.search.includes(query))
        : signatures;

    async function handleConfirmDelete() {
        if (!pendingDelete) return;
        setIsDeleting(true);

        try {
            await deleteSignature(pendingDelete.id);
            setSignatures(current => current.filter(signature => signature.id !== pendingDelete.id));
            toast('success', 'Signature deleted');
            setPendingDelete(null);
        } catch (error) {
            console.error('Error deleting signature:', error);
            toast('error', error instanceof Error ? error.message : 'Could not delete signature');
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleCopy(html: string, asCode = false) {
        try {
            if (asCode) {
                await copySignatureHtmlCode(html);
                toast('success', 'HTML code copied');
            } else {
                await copySignature(html);
                toast('success', 'Copied. Now paste it into your email signature settings.', { label: 'Open install guide', href: '/guides' });
            }
        } catch (error) {
            console.error('Error copying signature:', error);
            toast('error', 'Could not copy. Please allow clipboard access and try again.');
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
            <PageHeader
                tag="Library"
                title="My signatures"
                description={signatures.length
                    ? `${signatures.length} saved signature${signatures.length !== 1 ? 's' : ''}. Copy one and paste it into your email app.`
                    : 'Signatures you save appear here, ready to copy.'}
                actions={
                    <Button asChild>
                        <Link href="/generateSignature"><Plus /> New signature</Link>
                    </Button>
                }
            />

            {signatures.length > 1 && (
                <div className="relative w-full max-w-sm">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-10"
                        placeholder="Search by name, email, title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        type="search"
                        aria-label="Search signatures"
                    />
                </div>
            )}

            {signatures.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <AnimatePresence initial={false}>
                        {visibleSignatures.map((signature) => {
                            const text = signatureTexts.get(signature.id);
                            return (
                                <motion.article
                                    key={signature.id}
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.97 }}
                                    transition={{ duration: 0.2 }}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(6,27,49,0.3)]"
                                >
                                    <div className="relative flex h-44 items-center overflow-hidden bg-white p-5">
                                        <ScaledSignature html={signature.html} />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 border-t border-line p-4">
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate text-sm font-medium text-ink">{text?.title}</span>
                                            {text?.subtitle && <span className="truncate text-[13px] text-muted-foreground">{text.subtitle}</span>}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <Button size="sm" onClick={() => handleCopy(signature.html)}>
                                                <Copy /> Copy
                                            </Button>
                                            <Button variant="ghost" size="icon-sm" onClick={() => handleCopy(signature.html, true)} title="Copy HTML code" aria-label="Copy HTML code">
                                                <Code2 />
                                            </Button>
                                            <Button variant="ghost" size="icon-sm" asChild title="Analytics">
                                                <Link href={`/analytics?signature=${signature.id}`} aria-label="Analytics"><BarChart3 /></Link>
                                            </Button>
                                            <Button variant="ghost" size="icon-sm" onClick={() => setPendingDelete(signature)} title="Delete" aria-label="Delete" className="hover:text-destructive">
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.article>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}

            {signatures.length > 0 && visibleSignatures.length === 0 && (
                <p className="text-sm text-muted-foreground">No signatures match &quot;{search}&quot;.</p>
            )}

            {signatures.length === 0 && (
                <div className="flex flex-col items-center gap-5 overflow-hidden rounded-3xl bg-stage-hero px-6 py-16 text-center">
                    <div className="flex w-full max-w-xs flex-col gap-2 rounded-2xl bg-white/80 p-4 text-left shadow-[0_12px_32px_-16px_rgba(6,27,49,0.35)]" aria-hidden="true">
                        <div className="flex items-center gap-3">
                            <span className="size-10 rounded-full bg-brand/50" />
                            <div className="flex flex-1 flex-col gap-1.5">
                                <span className="h-2.5 w-2/3 rounded-full bg-ink/20" />
                                <span className="h-2 w-1/2 rounded-full bg-ink/10" />
                            </div>
                        </div>
                    </div>
                    <h2 className="text-2xl text-ink">No signatures yet</h2>
                    <p className="max-w-sm text-sm text-ink/75">Build your first signature in a few steps, or create one for your whole team from a CSV.</p>
                    <Button size="lg" asChild>
                        <Link href="/generateSignature"><Plus /> Create a signature</Link>
                    </Button>
                </div>
            )}

            <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && !isDeleting && setPendingDelete(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete this signature?</DialogTitle>
                        <DialogDescription>
                            {pendingDelete && <>&ldquo;{signatureTexts.get(pendingDelete.id)?.title}&rdquo; will be removed from your library. </>}
                            This can&apos;t be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={isDeleting}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                            {isDeleting ? <><Loader2 className="animate-spin" /> Deleting...</> : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
