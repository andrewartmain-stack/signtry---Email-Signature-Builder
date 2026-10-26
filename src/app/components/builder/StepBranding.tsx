"use client"

import React, { FC } from 'react'
import { Ban, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

import Field, { Section } from './Field'
import ImagePicker from '../ImagePicker'
import Switch from '../Switch'

import { DEMO_BANNER, DEMO_COMPANY_LOGO_URL } from '../../demoData'

import { StepProps } from './types'

const StepBranding: FC<StepProps & {
    badgeTemplates: string[];
    isGeneratingHandwriting: boolean;
    onImageFile: (file: File, key: 'companyLogoUrl' | 'bannerUrl') => void;
}> = ({ design, updateDesign, options, updateOptions, badgeTemplates, isGeneratingHandwriting, onImageFile }) => {
    return (
        <div className="flex flex-col gap-6">
            <Section title="Handwritten signature">
                <Switch
                    checked={options.handwritten}
                    onCheckedChange={(handwritten) => updateOptions({ handwritten })}
                    label="Add a handwritten signature"
                    description={
                        isGeneratingHandwriting
                            ? <span className="inline-flex items-center gap-1.5"><Loader2 className="size-3.5 animate-spin" /> Updating from your name...</span>
                            : 'Generated from your name, readable on light and dark backgrounds.'
                    }
                />
            </Section>

            <Section title="Company logo">
                <Switch
                    checked={options.logo}
                    onCheckedChange={(logo) => updateOptions({ logo })}
                    label="Show a company logo"
                    description="Displayed 28px tall; a transparent PNG looks best."
                />
                {options.logo && (
                    <ImagePicker
                        label="Logo image"
                        src={design.companyLogoUrl || DEMO_COMPANY_LOGO_URL}
                        previewClassName="w-28"
                        onFile={(file) => onImageFile(file, 'companyLogoUrl')}
                        onReset={design.companyLogoUrl ? () => updateDesign({ companyLogoUrl: '' }) : undefined}
                    />
                )}
            </Section>

            <Section title="Banner">
                <Switch
                    checked={options.banner}
                    onCheckedChange={(banner) => updateOptions({ banner })}
                    label="Add a banner under the signature"
                    description="Shown at 250 × 80. Larger images are cropped to fit."
                />
                {options.banner && (
                    <>
                        <ImagePicker
                            label="Banner image"
                            src={design.bannerUrl || DEMO_BANNER}
                            previewClassName="w-40"
                            onFile={(file) => onImageFile(file, 'bannerUrl')}
                            onReset={design.bannerUrl ? () => updateDesign({ bannerUrl: '' }) : undefined}
                        />
                        <Field
                            label="Banner link"
                            optional
                            placeholder="yourcompany.com/offer"
                            value={design.bannerLink}
                            onChange={(e) => updateDesign({ bannerLink: e.target.value })}
                        />
                    </>
                )}
            </Section>

            {badgeTemplates.length > 0 && (
                <Section title="Badge" description="A small badge next to your name.">
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Badge">
                        {['', ...badgeTemplates].map(badge => {
                            const isSelected = badge === design.badgeTemplate;
                            return (
                                <button
                                    key={badge || 'none'}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    aria-label={badge ? 'Badge' : 'No badge'}
                                    onClick={() => updateDesign({ badgeTemplate: badge })}
                                    className={cn(
                                        'flex size-11 cursor-pointer items-center justify-center rounded-xl border bg-white p-2 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-action/35',
                                        isSelected ? 'border-action ring-1 ring-action' : 'border-line hover:border-ink/25'
                                    )}
                                >
                                    {badge
                                        ? <img src={badge} alt="" className="max-h-full max-w-full" />
                                        : <Ban className="size-4 text-muted-foreground" />}
                                </button>
                            )
                        })}
                    </div>
                </Section>
            )}
        </div>
    )
}

export default StepBranding
