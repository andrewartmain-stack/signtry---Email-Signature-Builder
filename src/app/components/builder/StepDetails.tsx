"use client"

import React, { FC } from 'react'

import Field, { ControlRow, Section } from './Field'
import ImagePicker from '../ImagePicker'
import SegmentedControl from '../SegmentedControl'

import { DEMO_PHOTO } from '../../demoData'

import { fieldError, StepProps } from './types'

const PHOTO_SIZES = ['50', '60', '70', '80', '90', '100'];

const PHOTO_SHAPES = [
    { value: '', label: 'Square' },
    { value: 'border-radius: 10px !important;', label: 'Rounded' },
    { value: 'border-radius: 20px !important;', label: 'Soft' },
    { value: 'border-radius: 50% !important;', label: 'Circle' },
];

// Shown only when the selected template has a place for them
const EXTRA_FIELDS = [
    { key: 'credentials', label: 'Credentials', placeholder: 'MD, MBA, CPA, Esq.', hint: 'Shown after your name.' },
    { key: 'pronouns', label: 'Pronouns', placeholder: 'she/her' },
    { key: 'licenseNumber', label: 'License number', placeholder: 'DRE #01234567, NPI, Bar No.' },
    { key: 'websiteUrl', label: 'Website', placeholder: 'yourcompany.com' },
    { key: 'address', label: 'Office address', placeholder: '1450 Market St, San Francisco, CA' },
    { key: 'tagline', label: 'Tagline or disclaimer', placeholder: 'A short line, or a confidentiality notice', maxLength: 220 },
] as const;

const StepDetails: FC<StepProps & { onImageFile: (file: File, key: 'photoUrl') => void; templateKeys: Set<string> }> = ({ design, updateDesign, issues, onImageFile, templateKeys }) => {
    const extraFields = EXTRA_FIELDS.filter(field => templateKeys.has(field.key));

    // Older designs may use radii that are no longer offered; show them as Rounded
    const shapeValue = PHOTO_SHAPES.some(shape => shape.value === design.photoBorderRadius)
        ? design.photoBorderRadius
        : 'border-radius: 10px !important;';

    return (
        <div className="flex flex-col gap-6">
            <Section title="About you">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                        label="First name"
                        value={design.firstName}
                        onChange={(e) => updateDesign({ firstName: e.target.value })}
                        error={fieldError(issues, 'firstName')}
                        autoComplete="given-name"
                        required
                    />
                    <Field label="Last name" optional value={design.lastName} onChange={(e) => updateDesign({ lastName: e.target.value })} autoComplete="family-name" />
                    <Field label="Job title" optional value={design.jobTitle} onChange={(e) => updateDesign({ jobTitle: e.target.value })} autoComplete="organization-title" />
                    <Field label="Company" optional value={design.company} onChange={(e) => updateDesign({ company: e.target.value })} autoComplete="organization" />
                    <Field
                        label="Email"
                        optional
                        type="email"
                        value={design.email}
                        onChange={(e) => updateDesign({ email: e.target.value })}
                        error={fieldError(issues, 'email')}
                        autoComplete="email"
                    />
                    <Field
                        label="Phone"
                        optional
                        type="tel"
                        inputMode="tel"
                        value={design.phone}
                        onChange={(e) => updateDesign({ phone: e.target.value.replace(/[^0-9+]/g, '') })}
                        hint="Digits and + only, e.g. +14155550123"
                        autoComplete="tel"
                    />
                </div>
            </Section>

            {extraFields.length > 0 && (
                <Section title="Professional details" description="This template has room for these. Leave any empty to hide it.">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {extraFields.map(field => (
                            <div key={field.key} className={field.key === 'tagline' || field.key === 'address' ? 'sm:col-span-2' : undefined}>
                                <Field
                                    label={field.label}
                                    optional
                                    placeholder={field.placeholder}
                                    hint={'hint' in field ? field.hint : undefined}
                                    maxLength={'maxLength' in field ? field.maxLength : 120}
                                    value={design[field.key]}
                                    onChange={(e) => updateDesign({ [field.key]: e.target.value })}
                                    inputMode={field.key === 'websiteUrl' ? 'url' : undefined}
                                />
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            <Section title="Photo" description="A square photo works best. It is cropped around your face automatically.">
                <ImagePicker
                    label="Profile photo"
                    src={design.photoUrl}
                    onFile={(file) => onImageFile(file, 'photoUrl')}
                    onReset={design.photoUrl !== DEMO_PHOTO ? () => updateDesign({ photoUrl: DEMO_PHOTO }) : undefined}
                />
                <ControlRow label="Size">
                    <SegmentedControl
                        label="Photo size"
                        value={design.photoSize}
                        onChange={(photoSize) => updateDesign({ photoSize })}
                        options={PHOTO_SIZES.map(size => ({ value: size, label: size }))}
                    />
                </ControlRow>
                <ControlRow label="Shape">
                    <SegmentedControl
                        label="Photo shape"
                        value={shapeValue}
                        onChange={(photoBorderRadius) => updateDesign({ photoBorderRadius })}
                        options={PHOTO_SHAPES}
                    />
                </ControlRow>
                <Field
                    label="Photo link"
                    optional
                    placeholder="linkedin.com/in/you"
                    value={design.photoLink}
                    onChange={(e) => updateDesign({ photoLink: e.target.value })}
                    hint="Where people go when they click your photo."
                />
            </Section>
        </div>
    )
}

export default StepDetails
