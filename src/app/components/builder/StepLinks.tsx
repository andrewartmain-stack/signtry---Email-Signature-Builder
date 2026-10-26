"use client"

import React, { FC } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import Field, { Section } from './Field'
import Switch from '../Switch'

import { getSocialLabel, MAX_SOCIAL_ICONS, SocialIcon, socialLinkKey } from '../../utils/signatureDesign'

import { fieldError, StepProps } from './types'

const PLACEHOLDERS: Record<string, string> = {
    linkedin: 'linkedin.com/in/you',
    x: 'x.com/you',
    facebook: 'facebook.com/you',
    instagram: 'instagram.com/you',
    whatsapp: 'wa.me/14155550123',
    youtube: 'youtube.com/@you',
    tiktok: 'tiktok.com/@you',
    github: 'github.com/you',
    website: 'yourcompany.com',
};

const StepLinks: FC<StepProps & {
    socialIcons: SocialIcon[];
    selectedSocial: string[];
    setSelectedSocial: (names: string[]) => void;
}> = ({ design, updateDesign, options, updateOptions, issues, socialIcons, selectedSocial, setSelectedSocial }) => {
    const isFull = selectedSocial.length >= MAX_SOCIAL_ICONS;

    function toggleIcon(name: string) {
        if (selectedSocial.includes(name)) {
            setSelectedSocial(selectedSocial.filter(selected => selected !== name));
        } else if (!isFull) {
            setSelectedSocial([...selectedSocial, name]);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <Section title="Social icons">
                <Switch
                    checked={options.social}
                    onCheckedChange={(social) => updateOptions({ social })}
                    label="Show social icons"
                    description={`Pick up to ${MAX_SOCIAL_ICONS}.`}
                />
                {options.social && (
                    <>
                        <div className="flex flex-wrap gap-2">
                            {socialIcons.map(icon => {
                                const isSelected = selectedSocial.includes(icon.name);
                                const isDisabled = !isSelected && isFull;
                                return (
                                    <button
                                        key={icon.name}
                                        type="button"
                                        aria-pressed={isSelected}
                                        disabled={isDisabled}
                                        onClick={() => toggleIcon(icon.name)}
                                        className={cn(
                                            'flex h-10 cursor-pointer items-center gap-2 rounded-full border bg-white pr-3.5 pl-2 text-[13px] font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-action/35 disabled:cursor-not-allowed disabled:opacity-40',
                                            isSelected ? 'border-action text-ink ring-1 ring-action' : 'border-line text-muted-foreground hover:border-ink/25 hover:text-ink'
                                        )}
                                    >
                                        <img src={options.animatedIcons ? icon.gif : icon.png} alt="" className="size-6" />
                                        {getSocialLabel(icon.name)}
                                        {isSelected && <Check className="size-3.5 text-action" strokeWidth={3} />}
                                    </button>
                                )
                            })}
                        </div>
                        <span className="-mt-1 text-[13px] text-muted-foreground">{selectedSocial.length} of {MAX_SOCIAL_ICONS} selected</span>

                        {selectedSocial.length > 0 && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {selectedSocial.map(name => (
                                    <Field
                                        key={name}
                                        label={getSocialLabel(name)}
                                        placeholder={PLACEHOLDERS[name] ?? 'https://'}
                                        value={design[socialLinkKey(name)] ?? ''}
                                        onChange={(e) => updateDesign({ [socialLinkKey(name)]: e.target.value })}
                                        error={fieldError(issues, socialLinkKey(name))}
                                        inputMode="url"
                                    />
                                ))}
                            </div>
                        )}

                        <Switch
                            checked={options.animatedIcons}
                            onCheckedChange={(animatedIcons) => updateOptions({ animatedIcons })}
                            label="Animate icons"
                            description="Outlook desktop shows only the first frame."
                        />
                    </>
                )}
            </Section>

            <Section title="Buttons">
                <Switch
                    checked={options.buttons}
                    onCheckedChange={(buttons) => updateOptions({ buttons })}
                    label="Add call-to-action buttons"
                    description="Up to two, e.g. “Book a call”. Leave a label empty to hide that button."
                />
                {options.buttons && ([1, 2] as const).map(n => (
                    <div key={n} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field
                            label={`Button ${n} label`}
                            value={design[`button${n}Text`]}
                            onChange={(e) => updateDesign({ [`button${n}Text`]: e.target.value })}
                            error={n === 1 ? fieldError(issues, 'button1Text') : undefined}
                            maxLength={30}
                        />
                        <Field
                            label={`Button ${n} link`}
                            placeholder="calendly.com/you"
                            value={design[`button${n}Link`]}
                            onChange={(e) => updateDesign({ [`button${n}Link`]: e.target.value })}
                            error={fieldError(issues, `button${n}Link`)}
                            inputMode="url"
                        />
                    </div>
                ))}
            </Section>
        </div>
    )
}

export default StepLinks
