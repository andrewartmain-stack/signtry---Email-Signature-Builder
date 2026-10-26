"use client"

import React, { FC, useEffect, useState } from 'react'
import { Download, FileSpreadsheet, ImagePlus, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import {
    buildSignatureToSave,
    fetchSignatureQuota,
    saveSignatures,
    SignatureToSave,
    uploadSharedImages,
} from '../services/api'
import { applyPersonToDesign, buildCsvTemplate, BulkPerson, parseBulkCsv } from '../utils/bulkSignatures'

import { FormUserDataInterface } from '../types'

// Signatures are built a few at a time (each needs image uploads) and saved
// in chunks so a large team never hits request size or time limits.
const BUILD_CONCURRENCY = 4;
const SAVE_CHUNK_SIZE = 10;

type RowStatus = { state: 'pending' | 'done' | 'error'; message?: string };

async function runWithConcurrency<T>(items: T[], limit: number, worker: (item: T, index: number) => Promise<void>) {
    let next = 0;
    await Promise.all(
        Array.from({ length: Math.min(limit, items.length) }, async () => {
            while (next < items.length) {
                const index = next++;
                await worker(items[index], index);
            }
        })
    );
}

const BulkGenerateDialog: FC<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    htmlTemplate: string;
    design: FormUserDataInterface;
    onFinished: (message: string, type: "success" | "error") => void;
}> = ({ isOpen, setIsOpen, htmlTemplate, design, onFinished }) => {

    const [csvText, setCsvText] = useState('');
    const [csvFileName, setCsvFileName] = useState('');
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [quota, setQuota] = useState<{ limit: number; remaining: number } | null>(null);
    const [statuses, setStatuses] = useState<Record<number, RowStatus>>({});
    const [progress, setProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        fetchSignatureQuota()
            .then(setQuota)
            .catch(error => setErrorMessage(error.message));
    }, [isOpen]);

    const { people, error: csvError } = csvText
        ? parseBulkCsv(csvText, photoFiles)
        : { people: [] as BulkPerson[], error: '' };

    const validPeople = people.filter(person => person.errors.length === 0);
    const invalidCount = people.length - validPeople.length;
    const doneCount = Object.values(statuses).filter(status => status.state === 'done').length;
    // Rerunning after a partial failure only retries rows not created yet
    const peopleToCreate = validPeople.filter(person => statuses[person.rowNumber]?.state !== 'done');
    const overQuota = quota !== null && peopleToCreate.length > quota.remaining;

    function handleDownloadTemplate() {
        const blob = new Blob([buildCsvTemplate(design, htmlTemplate)], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'team-signatures.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    async function handleCsvChange(file: File | null) {
        setStatuses({});
        setProgress(0);
        setCsvFileName(file?.name ?? '');
        setCsvText(file ? await file.text() : '');
    }

    function setStatus(rowNumber: number, status: RowStatus) {
        setStatuses(current => ({ ...current, [rowNumber]: status }));
    }

    async function handleGenerate() {
        setIsRunning(true);
        setErrorMessage('');
        const queue = peopleToCreate;
        setStatuses(current => ({
            ...current,
            ...Object.fromEntries(queue.map(person => [person.rowNumber, { state: 'pending' as const }])),
        }));
        setProgress(0);

        const total = queue.length;
        let finished = 0;
        let created = 0;
        const markFinished = () => setProgress(Math.round((++finished / total) * 100));

        try {
            // Logo and banner are the same for everyone: upload them once
            const shared = await uploadSharedImages(design);

            const built: { person: BulkPerson; signature: SignatureToSave }[] = [];

            await runWithConcurrency(queue, BUILD_CONCURRENCY, async (person) => {
                try {
                    const signature = await buildSignatureToSave(
                        htmlTemplate,
                        applyPersonToDesign(design, person),
                        shared,
                        { photo: person.photoFile, generateSignatureFromName: true }
                    );
                    built.push({ person, signature });
                } catch (error) {
                    setStatus(person.rowNumber, { state: 'error', message: error instanceof Error ? error.message : 'Failed' });
                    markFinished();
                }
            });

            // Save in the original CSV order
            built.sort((a, b) => a.person.rowNumber - b.person.rowNumber);

            for (let i = 0; i < built.length; i += SAVE_CHUNK_SIZE) {
                const chunk = built.slice(i, i + SAVE_CHUNK_SIZE);
                const result = await saveSignatures(chunk.map(item => item.signature));
                if (result.ok) created += chunk.length;

                chunk.forEach(item => {
                    setStatus(item.person.rowNumber, result.ok
                        ? { state: 'done' }
                        : { state: 'error', message: result.message });
                    markFinished();
                });

                // Plan limit reached: the remaining chunks would fail the same way
                if (!result.ok && result.status === 403) {
                    built.slice(i + SAVE_CHUNK_SIZE).forEach(item => {
                        setStatus(item.person.rowNumber, { state: 'error', message: result.message });
                        markFinished();
                    });
                    break;
                }
            }

            fetchSignatureQuota().then(setQuota).catch(() => undefined);

            onFinished(
                created ? `${created} of ${total} signatures created` : 'No signatures were created',
                created === total ? 'success' : 'error'
            );
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Bulk generation failed');
        } finally {
            setIsRunning(false);
        }
    }

    const statusLabel = (person: BulkPerson) => {
        const status = statuses[person.rowNumber];
        if (person.errors.length > 0) return <span className="text-destructive">{person.errors.join(', ')}</span>;
        if (status?.state === 'done') return <span className="font-medium text-ink">Created</span>;
        if (status?.state === 'error') return <span className="text-destructive">{status.message}</span>;
        if (status?.state === 'pending') return <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Working</span>;
        return <span className="text-muted-foreground">Ready</span>;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isRunning && setIsOpen(open)}>
            <DialogContent className="scrollbar-thin max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Signatures for your whole team</DialogTitle>
                    <DialogDescription>
                        Everyone gets the design you just built (template, colors, logo, banner, badge, icons and buttons) with their own details.
                        {design.signatureImageUrl && ' Each person also gets a handwritten signature made from their name.'}
                    </DialogDescription>
                </DialogHeader>

                <ol className="flex flex-col gap-3 text-sm">
                    <li className="flex flex-col gap-3 rounded-xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-3">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">1</span>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-ink">Download the spreadsheet</span>
                                <span className="text-[13px] text-muted-foreground">One row per person. Only firstName is required.</span>
                            </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate}>
                            <Download /> CSV template
                        </Button>
                    </li>

                    <li className="flex flex-col gap-3 rounded-xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-3">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">2</span>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-ink">Upload the filled-in CSV</span>
                                <span className="text-[13px] text-muted-foreground">{csvFileName || 'Exported from Excel, Google Sheets or Numbers.'}</span>
                            </div>
                        </div>
                        <Button type="button" variant={csvFileName ? 'outline' : 'default'} size="sm" asChild>
                            <label className={isRunning ? 'pointer-events-none opacity-45' : ''}>
                                <FileSpreadsheet /> {csvFileName ? 'Replace CSV' : 'Choose CSV'}
                                <input type="file" accept=".csv,text/csv" className="sr-only" disabled={isRunning}
                                    onChange={(e) => { handleCsvChange(e.target.files?.[0] ?? null); e.target.value = ''; }} />
                            </label>
                        </Button>
                    </li>

                    <li className="flex flex-col gap-3 rounded-xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-3">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink/[0.08] text-xs font-semibold text-ink">3</span>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-ink">Add photos <span className="font-normal text-muted-foreground">(optional)</span></span>
                                <span className="text-[13px] text-muted-foreground">
                                    {photoFiles.length
                                        ? `${photoFiles.length} photo${photoFiles.length === 1 ? '' : 's'} selected`
                                        : <>Put a file name (jane.jpg) or an https URL in the photo column. Rows without one use your design&apos;s photo.</>}
                                </span>
                            </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" asChild>
                            <label className={isRunning ? 'pointer-events-none opacity-45' : ''}>
                                <ImagePlus /> Select photos
                                <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" disabled={isRunning}
                                    onChange={(e) => setPhotoFiles(Array.from(e.target.files ?? []))} />
                            </label>
                        </Button>
                    </li>
                </ol>

                {csvError && <p className="text-sm text-destructive">{csvFileName}: {csvError}</p>}
                {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

                {people.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
                            <span><b className="font-medium text-ink">{validPeople.length}</b> ready</span>
                            {invalidCount > 0 && <span className="text-destructive">{invalidCount} with errors (will be skipped)</span>}
                            {quota && <span>{quota.remaining} of {quota.limit} signatures left on your plan</span>}
                        </div>
                        {overQuota && (
                            <p className="text-sm text-destructive">
                                Your plan has room for {quota?.remaining} more signatures. Remove some rows or upgrade your plan.
                            </p>
                        )}

                        <div className="scrollbar-thin max-h-64 overflow-auto rounded-xl border border-line">
                            <Table>
                                <TableHeader className="sticky top-0 bg-card">
                                    <TableRow>
                                        <TableHead>Row</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Photo</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {people.map(person => (
                                        <TableRow key={person.rowNumber}>
                                            <TableCell className="text-muted-foreground">{person.rowNumber}</TableCell>
                                            <TableCell className="font-medium">{person.values.firstName} {person.values.lastName}</TableCell>
                                            <TableCell>{person.values.email}</TableCell>
                                            <TableCell>{person.values.jobTitle}</TableCell>
                                            <TableCell className="text-muted-foreground">{person.photoFile ? person.photoFile.name : person.values.photo ? 'URL' : 'Design'}</TableCell>
                                            <TableCell className="whitespace-normal">{statusLabel(person)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {(isRunning || progress > 0) && (
                    <div className="flex flex-col gap-1.5">
                        <Progress value={progress} className="h-2" />
                        <span className="text-[13px] text-muted-foreground">{doneCount} created · {progress}%</span>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="action"
                        onClick={handleGenerate}
                        disabled={isRunning || peopleToCreate.length === 0 || overQuota || !htmlTemplate}
                    >
                        {isRunning
                            ? <><Loader2 className="animate-spin" /> Generating...</>
                            : `Generate ${peopleToCreate.length || ''} signature${peopleToCreate.length === 1 ? '' : 's'}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default BulkGenerateDialog
