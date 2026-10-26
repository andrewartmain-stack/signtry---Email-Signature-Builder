"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import PageHeader from '../../components/PageHeader';
import EmailPreview from '../../components/EmailPreview';
import BulkGenerateDialog from '../../components/BulkGenerateDialog';
import Stepper from '../../components/builder/Stepper';
import StepTemplate from '../../components/builder/StepTemplate';
import StepDetails from '../../components/builder/StepDetails';
import StepBranding from '../../components/builder/StepBranding';
import StepLinks from '../../components/builder/StepLinks';
import StepStyle from '../../components/builder/StepStyle';
import StepSave, { SavedResult } from '../../components/builder/StepSave';
import { useToast } from '../../components/Toast';

import { generateSignatureImage, saveSignature } from '../../services/api';

import { renderSignature } from "../../utils/renderSignature";
import { optimizeSignatureHtml } from '../../utils/optimizeSignatureHtml';
import { convertImageToBase64 } from '../../utils/convertImageToBase64';
import { copySignature } from '../../utils/copySignature';
import { handleConfetti } from '../../utils/confetti';
import {
    BUILDER_STEPS,
    BuilderOptions,
    BuilderStepId,
    buildSignatureData,
    DEFAULT_BUILDER_OPTIONS,
    getDesignIssues,
    getInitialSocialSelection,
} from '../../utils/signatureDesign';
import { getTemplateKeys } from '../../templates/industryTemplates';

import { FormUserDataInterface, SignatureTemplateInterface } from '../../types';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export default function GenerateSignaturesClient({ demoUserData, templates, badgeTemplates, socialIcons }: { demoUserData: FormUserDataInterface, templates: SignatureTemplateInterface[], badgeTemplates: string[], socialIcons: { name: string, png: string, gif: string }[] }) {

    /*===========STATE============ */
    const [step, setStep] = useState<BuilderStepId>('template');
    const [visited, setVisited] = useState<Set<BuilderStepId>>(() => new Set(['template']));
    const [templateId, setTemplateId] = useState<number | null>(templates[0]?.id ?? null);
    const [design, setDesign] = useState<FormUserDataInterface>(demoUserData);
    const [options, setOptions] = useState<BuilderOptions>(DEFAULT_BUILDER_OPTIONS);
    const [selectedSocial, setSelectedSocial] = useState<string[]>(() => getInitialSocialSelection(demoUserData, socialIcons));
    const [isGeneratingHandwriting, setIsGeneratingHandwriting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState<SavedResult | null>(null);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

    const panelRef = useRef<HTMLElement>(null);
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const isFirstNameChange = useRef(true);

    const router = useRouter();
    const toast = useToast();

    const template = templates.find(item => item.id === templateId) ?? null;
    const stepIndex = BUILDER_STEPS.findIndex(item => item.id === step);
    const stepInfo = BUILDER_STEPS[stepIndex];

    /*=======DERIVED=======*/
    const signatureData = useMemo(
        () => buildSignatureData(design, options, socialIcons, selectedSocial),
        [design, options, socialIcons, selectedSocial]
    );

    const issues = useMemo(
        () => getDesignIssues(design, options, selectedSocial),
        [design, options, selectedSocial]
    );

    // Don't flag fields before the user has tried to save: the demo starts
    // with icons whose links are still empty
    const hasReachedSave = visited.has('save');
    const visibleIssues = useMemo(() => hasReachedSave ? issues : [], [hasReachedSave, issues]);
    const stepsWithIssues = useMemo(() => new Set(visibleIssues.map(issue => issue.step)), [visibleIssues]);

    // Which fields and style options the selected template actually uses
    const templateKeys = useMemo(() => getTemplateKeys(template?.html ?? ''), [template]);

    // Preview exactly what gets saved: same email-client optimizations
    const previewHtml = useMemo(
        () => template ? optimizeSignatureHtml(renderSignature(template.html, { ...signatureData })) : '',
        [template, signatureData]
    );

    /*=======ACTIONS=======*/
    const updateDesign = useCallback((patch: Partial<FormUserDataInterface>) => {
        setDesign(current => ({ ...current, ...patch }));
        setSaved(null);
    }, []);

    const updateOptions = useCallback((patch: Partial<BuilderOptions>) => {
        setOptions(current => ({ ...current, ...patch }));
        setSaved(null);
    }, []);

    function goTo(next: BuilderStepId) {
        setStep(next);
        setVisited(current => new Set(current).add(next));
        // Long steps: make sure the new step starts at its top
        const panel = panelRef.current;
        if (panel && panel.getBoundingClientRect().top < 0) {
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    async function handleImageFile(file: File, key: 'photoUrl' | 'companyLogoUrl' | 'bannerUrl') {
        // Matches the server limit; images are resized for email on save
        if (file.size > MAX_IMAGE_BYTES) {
            toast('error', 'That image is larger than 8MB. Please pick a smaller one.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        const dataUrl = await convertImageToBase64(formData);
        if (dataUrl) updateDesign({ [key]: dataUrl });
    }

    // The handwritten signature follows the name, debounced while typing
    const fullName = `${design.firstName} ${design.lastName}`.trim();
    useEffect(() => {
        if (isFirstNameChange.current) {
            // The demo already ships with a matching image
            isFirstNameChange.current = false;
            return;
        }
        if (!options.handwritten || !fullName) return;

        let isCurrent = true;
        setIsGeneratingHandwriting(true);
        const timer = setTimeout(() => {
            generateSignatureImage(fullName)
                .then(url => {
                    // Functional update: the form may have changed meanwhile
                    if (isCurrent && url) setDesign(current => ({ ...current, signatureImageUrl: url }));
                })
                .catch(() => undefined)
                .finally(() => { if (isCurrent) setIsGeneratingHandwriting(false); });
        }, 600);

        return () => {
            isCurrent = false;
            clearTimeout(timer);
            setIsGeneratingHandwriting(false);
        };
    }, [fullName, options.handwritten]);

    async function handleSave() {
        if (!template || issues.length > 0) return;

        setIsSaving(true);
        try {
            const result = await saveSignature(signatureData, template.html);

            if (result.ok) {
                setSaved({ html: result.htmls?.[0] ?? previewHtml, warnings: result.warnings ?? [] });
                if (saveButtonRef.current) handleConfetti(saveButtonRef.current);
                // Drop cached pages so "My signatures" shows the new one right away
                router.refresh();
            } else {
                toast('error', result.message || 'Could not save the signature');
            }
        } catch (error) {
            toast('error', error instanceof Error ? error.message : 'Could not save the signature');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleCopySaved() {
        if (!saved) return;
        try {
            await copySignature(saved.html);
            toast('success', 'Copied. Now paste it into your email signature settings.', { label: 'Open install guide', href: '/guides' });
        } catch {
            toast('error', 'Could not copy. Please allow clipboard access and try again.');
        }
    }

    function handleBulkFinished(message: string, type: "success" | "error") {
        toast(type, message, type === 'success' ? { label: 'View signatures', href: '/signatures' } : undefined);
        router.refresh();
    }

    const isLastStep = stepIndex === BUILDER_STEPS.length - 1;

    return (
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
            <PageHeader
                tag="Signature builder"
                title="Create your signature"
                description="Six short steps. The preview updates as you go, and nothing is saved until the last step."
                actions={
                    <Button variant="outline" onClick={() => goTo('save')}>
                        <Users /> Creating for a team?
                    </Button>
                }
            />

            <Stepper current={step} visited={visited} stepsWithIssues={stepsWithIssues} onSelect={goTo} />

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
                <section ref={panelRef} className="flex scroll-mt-6 flex-col rounded-2xl border border-line bg-card" aria-labelledby="builder-step-title">
                    <div className="flex flex-col gap-1.5 border-b border-line px-5 py-5 md:px-6">
                        <span className="text-xs font-medium text-muted-foreground">Step {stepIndex + 1} of {BUILDER_STEPS.length}</span>
                        <h2 id="builder-step-title" className="text-2xl text-ink">{stepInfo.title}</h2>
                        <p className="text-sm text-muted-foreground">{stepInfo.description}</p>
                    </div>

                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18 }}
                            className="px-5 py-6 md:px-6"
                        >
                            {step === 'template' && (
                                templates.length > 0
                                    ? <StepTemplate templates={templates} selectedId={templateId} onSelect={(item) => { setTemplateId(item.id); setSaved(null); }} signatureData={signatureData} design={design} demoUserData={demoUserData} />
                                    : <p className="text-sm text-muted-foreground">No templates are available right now. Please reload the page.</p>
                            )}
                            {step === 'details' && (
                                <StepDetails design={design} updateDesign={updateDesign} options={options} updateOptions={updateOptions} issues={visibleIssues} onImageFile={handleImageFile} templateKeys={templateKeys} />
                            )}
                            {step === 'branding' && (
                                <StepBranding
                                    design={design}
                                    updateDesign={updateDesign}
                                    options={options}
                                    updateOptions={updateOptions}
                                    issues={visibleIssues}
                                    badgeTemplates={badgeTemplates}
                                    isGeneratingHandwriting={isGeneratingHandwriting}
                                    onImageFile={handleImageFile}
                                />
                            )}
                            {step === 'links' && (
                                <StepLinks
                                    design={design}
                                    updateDesign={updateDesign}
                                    options={options}
                                    updateOptions={updateOptions}
                                    issues={visibleIssues}
                                    socialIcons={socialIcons}
                                    selectedSocial={selectedSocial}
                                    setSelectedSocial={(names) => { setSelectedSocial(names); setSaved(null); }}
                                />
                            )}
                            {step === 'style' && (
                                <StepStyle design={design} updateDesign={updateDesign} options={options} updateOptions={updateOptions} issues={visibleIssues} isHorizontalTemplate={template?.alignment === 'horizontal'} templateKeys={templateKeys} />
                            )}
                            {step === 'save' && (
                                <StepSave
                                    issues={issues}
                                    onFix={goTo}
                                    onSave={handleSave}
                                    onOpenBulk={() => setIsBulkDialogOpen(true)}
                                    onCopy={handleCopySaved}
                                    onCreateAnother={() => { setSaved(null); goTo('details'); }}
                                    isSaving={isSaving}
                                    saved={saved}
                                    saveButtonRef={saveButtonRef}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4 md:px-6">
                        <Button variant="ghost" onClick={() => goTo(BUILDER_STEPS[stepIndex - 1].id)} disabled={stepIndex === 0} className={stepIndex === 0 ? 'invisible' : ''}>
                            <ArrowLeft /> Back
                        </Button>
                        {!isLastStep && (
                            <Button onClick={() => goTo(BUILDER_STEPS[stepIndex + 1].id)}>
                                {BUILDER_STEPS[stepIndex + 1].id === 'save' ? 'Review' : `Next: ${BUILDER_STEPS[stepIndex + 1].label}`} <ArrowRight />
                            </Button>
                        )}
                    </div>
                </section>

                <aside className="flex flex-col gap-3 lg:sticky lg:top-6" aria-label="Signature preview">
                    {previewHtml
                        ? <EmailPreview html={previewHtml} senderName={fullName} />
                        : <div className="h-[420px] animate-pulse rounded-2xl bg-ink/[0.06]" />}
                    <p className="px-1 text-[13px] text-muted-foreground">
                        Images are optimized and hosted when you save, so they show up in Gmail, Outlook, Apple Mail and Yahoo.
                    </p>
                </aside>
            </div>

            {template && (
                <BulkGenerateDialog
                    isOpen={isBulkDialogOpen}
                    setIsOpen={setIsBulkDialogOpen}
                    htmlTemplate={template.html}
                    design={signatureData}
                    onFinished={handleBulkFinished}
                />
            )}
        </div>
    )
}
