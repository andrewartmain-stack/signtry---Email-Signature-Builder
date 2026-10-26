"use client"

import React, { FC } from 'react'

import { ControlRow, Section } from './Field'
import SegmentedControl from '../SegmentedControl'

import { FormUserDataInterface } from '../../types'

import { StepProps } from './types'

const TEXT_FIELDS = [
    { label: 'Name', size: 'nameFontSize', style: 'nameFontStyle' },
    { label: 'Job title', size: 'jobTitleFontSize', style: 'jobTitleFontStyle' },
    { label: 'Company', size: 'companyFontSize', style: 'companyFontStyle' },
    { label: 'Email', size: 'emailFontSize', style: 'emailFontStyle' },
    { label: 'Phone', size: 'phoneFontSize', style: 'phoneFontStyle' },
] as const satisfies { label: string; size: keyof FormUserDataInterface; style: keyof FormUserDataInterface }[];

const SIZES = [
    { value: '10px', label: 'S' },
    { value: '12px', label: 'M' },
    { value: '15px', label: 'L' },
];

const STYLES = [
    { value: '', label: 'Regular' },
    { value: 'font-weight: bold;', label: <b>Bold</b> },
    { value: 'font-style: italic;', label: <i>Italic</i> },
];

const SPACING = ['5px', '10px', '15px', '20px'].map(value => ({ value, label: value.replace('px', '') }));

const BACKGROUNDS = ['#ffffff', '#fcfbf8', '#f7f5ef', '#eaf3ff'];

const ACCENTS = [
    { value: '#0b5cff', name: 'Blue' },
    { value: '#0f766e', name: 'Teal' },
    { value: '#15803d', name: 'Green' },
    { value: '#b45309', name: 'Amber' },
    { value: '#be123c', name: 'Rose' },
    { value: '#6d28d9', name: 'Violet' },
    { value: '#111827', name: 'Black' },
];

// Fonts every email client has installed; anything else falls back
const FONTS = [
    { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
    { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
    { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
    { value: "'Trebuchet MS', Tahoma, sans-serif", label: 'Trebuchet' },
    { value: "Georgia, 'Times New Roman', serif", label: 'Georgia' },
    { value: "'Times New Roman', Times, serif", label: 'Times' },
];

const swatchClass = (isActive: boolean) =>
    `size-9 cursor-pointer rounded-full border border-line outline-none focus-visible:ring-[3px] focus-visible:ring-action/35 ${isActive ? 'ring-2 ring-action ring-offset-2' : ''}`;

const StepStyle: FC<StepProps & { isHorizontalTemplate: boolean; templateKeys: Set<string> }> = ({ design, updateDesign, isHorizontalTemplate, templateKeys }) => {
    return (
        <div className="flex flex-col gap-6">
            {templateKeys.has('accentColor') && (
                <Section title="Accent color" description="Used for highlights, dividers and buttons in this template.">
                    <div className="flex flex-wrap items-center gap-2">
                        {ACCENTS.map(accent => (
                            <button
                                key={accent.value}
                                type="button"
                                aria-label={`${accent.name} accent`}
                                aria-pressed={design.accentColor.toLowerCase() === accent.value}
                                title={accent.name}
                                onClick={() => updateDesign({ accentColor: accent.value })}
                                className={swatchClass(design.accentColor.toLowerCase() === accent.value)}
                                style={{ backgroundColor: accent.value }}
                            />
                        ))}
                        <label className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-line bg-card pr-3 pl-1 text-[13px] text-ink hover:border-ink/25">
                            <input
                                type="color"
                                value={design.accentColor}
                                onChange={(e) => updateDesign({ accentColor: e.target.value })}
                                className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-line [&::-webkit-color-swatch-wrapper]:p-0"
                                aria-label="Custom accent color"
                            />
                            Brand color
                        </label>
                    </div>
                </Section>
            )}

            {templateKeys.has('fontFamily') && (
                <Section title="Font" description="Email-safe fonts that look the same in Gmail, Outlook, Apple Mail and Yahoo.">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Font">
                        {FONTS.map(font => {
                            const isActive = design.fontFamily === font.value;
                            return (
                                <button
                                    key={font.label}
                                    type="button"
                                    role="radio"
                                    aria-checked={isActive}
                                    onClick={() => updateDesign({ fontFamily: font.value })}
                                    className={`flex h-14 cursor-pointer flex-col items-start justify-center rounded-xl border bg-white px-3.5 text-left outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-action/35 ${isActive ? 'border-action ring-1 ring-action' : 'border-line hover:border-ink/25'}`}
                                >
                                    <span className="text-[15px] text-ink" style={{ fontFamily: font.value }}>Aa {font.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </Section>
            )}

            <Section title="Text" description="Size and weight of each line.">
                <div className="flex flex-col gap-3">
                    {TEXT_FIELDS.map(field => (
                        <div key={field.label} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <span className="text-sm text-ink sm:w-24">{field.label}</span>
                            <div className="flex flex-wrap gap-2">
                                <SegmentedControl
                                    label={`${field.label} size`}
                                    value={design[field.size]}
                                    onChange={(value) => updateDesign({ [field.size]: value })}
                                    options={SIZES}
                                />
                                <SegmentedControl
                                    label={`${field.label} style`}
                                    value={design[field.style]}
                                    onChange={(value) => updateDesign({ [field.style]: value })}
                                    options={STYLES}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Background">
                <div className="flex flex-wrap items-center gap-2">
                    {BACKGROUNDS.map(color => (
                        <button
                            key={color}
                            type="button"
                            aria-label={`Background ${color}`}
                            aria-pressed={design.signatureBackgroundColor.toLowerCase() === color}
                            onClick={() => updateDesign({ signatureBackgroundColor: color })}
                            className={swatchClass(design.signatureBackgroundColor.toLowerCase() === color)}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                    <label className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-line bg-card pr-3 pl-1 text-[13px] text-ink hover:border-ink/25">
                        <input
                            type="color"
                            value={design.signatureBackgroundColor}
                            onChange={(e) => updateDesign({ signatureBackgroundColor: e.target.value })}
                            className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-line [&::-webkit-color-swatch-wrapper]:p-0"
                            aria-label="Custom background color"
                        />
                        Custom
                    </label>
                </div>
                <span className="-mt-1 text-[13px] text-muted-foreground">Light backgrounds keep your text readable in every email app.</span>
            </Section>

            <Section title="Layout">
                <ControlRow label="Inner spacing">
                    <SegmentedControl label="Inner spacing" value={design.signaturePadding} onChange={(signaturePadding) => updateDesign({ signaturePadding })} options={SPACING} />
                </ControlRow>
                <ControlRow label="Corner radius">
                    <SegmentedControl label="Corner radius" value={design.signatureBorderRadius} onChange={(signatureBorderRadius) => updateDesign({ signatureBorderRadius })} options={SPACING} />
                </ControlRow>
                {isHorizontalTemplate && (
                    <ControlRow label="Align photo and text">
                        <SegmentedControl
                            label="Vertical alignment"
                            value={design.signatureAlignment}
                            onChange={(signatureAlignment) => updateDesign({ signatureAlignment })}
                            options={[{ value: 'middle', label: 'Center' }, { value: 'top', label: 'Top' }]}
                        />
                    </ControlRow>
                )}
            </Section>
        </div>
    )
}

export default StepStyle
