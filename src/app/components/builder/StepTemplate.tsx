"use client"

import React, { FC, useMemo, useState } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import ScaledSignature from '../ScaledSignature'
import SegmentedControl from '../SegmentedControl'

import { renderSignature } from '../../utils/renderSignature'
import { optimizeSignatureHtml } from '../../utils/optimizeSignatureHtml'
import { CATEGORY_SAMPLES, TEMPLATE_CATEGORIES, TemplateCategory } from '../../templates/industryTemplates'

import { FormUserDataInterface, SignatureTemplateInterface } from '../../types'

type Layout = 'all' | 'horizontal' | 'vertical';

const categoryLabel = (id?: string) => TEMPLATE_CATEGORIES.find(category => category.id === id)?.label ?? 'General';

// Templates are previewed with the user's own details, so going back to
// this step after filling the form shows what each layout would look like.
// Fields still at their demo value show an industry example instead.
const StepTemplate: FC<{
    templates: SignatureTemplateInterface[];
    selectedId: number | null;
    onSelect: (template: SignatureTemplateInterface) => void;
    signatureData: FormUserDataInterface;
    design: FormUserDataInterface;
    demoUserData: FormUserDataInterface;
}> = ({ templates, selectedId, onSelect, signatureData, design, demoUserData }) => {
    const selected = templates.find(template => template.id === selectedId);
    const [category, setCategory] = useState<string>(selected?.category && selected.category !== 'general' ? selected.category : 'all');
    const [layout, setLayout] = useState<Layout>('all');

    const availableCategories = TEMPLATE_CATEGORIES.filter(item => templates.some(template => template.category === item.id));

    const visible = useMemo(() => templates.filter(template =>
        (category === 'all' || template.category === category) &&
        (layout === 'all' || template.alignment === layout)
    ), [templates, category, layout]);

    const previews = useMemo(() => {
        const dataFor = (templateCategory?: string) => {
            const sample = CATEGORY_SAMPLES[templateCategory as TemplateCategory];
            if (!sample) return signatureData;
            const data = { ...signatureData };
            (Object.keys(sample) as (keyof FormUserDataInterface)[]).forEach(key => {
                if (design[key] === demoUserData[key]) data[key] = sample[key] as string;
            });
            return data;
        };
        return new Map(visible.map(template => [
            template.id,
            optimizeSignatureHtml(renderSignature(template.html, { ...dataFor(template.category) })),
        ]));
    }, [visible, signatureData, design, demoUserData]);

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
                <div>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Industry">
                        {[{ id: 'all', label: 'All' }, ...availableCategories].map(item => {
                            const isActive = item.id === category;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={isActive}
                                    onClick={() => setCategory(item.id)}
                                    className={cn(
                                        'h-9 cursor-pointer rounded-full border px-4 text-[13px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-action/35',
                                        isActive ? 'border-ink bg-ink text-white' : 'border-line bg-card text-muted-foreground hover:border-ink/25 hover:text-ink'
                                    )}
                                >
                                    {item.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
                <SegmentedControl<Layout>
                    label="Layout"
                    value={layout}
                    onChange={setLayout}
                    className="w-fit"
                    options={[
                        { value: 'all', label: 'Any layout' },
                        { value: 'horizontal', label: 'Side by side' },
                        { value: 'vertical', label: 'Stacked' },
                    ]}
                />
            </div>

            {visible.length === 0 && (
                <p className="text-sm text-muted-foreground">No {layout === 'vertical' ? 'stacked' : 'side-by-side'} templates in this category yet.</p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                {visible.map(template => {
                    const isSelected = template.id === selectedId;
                    const name = template.name ?? `Essential ${templates.filter(item => !item.name).indexOf(template) + 1}`;
                    return (
                        <button
                            key={template.id}
                            type="button"
                            onClick={() => onSelect(template)}
                            aria-pressed={isSelected}
                            className={cn(
                                'group relative flex cursor-pointer flex-col gap-3 rounded-2xl border bg-white p-3 text-left transition-[border-color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-action/35',
                                isSelected
                                    ? 'border-action ring-1 ring-action'
                                    : 'border-line hover:border-ink/25 hover:shadow-[0_8px_24px_-12px_rgba(6,27,49,0.25)]'
                            )}
                        >
                            <div className="flex min-h-28 flex-1 items-center rounded-xl bg-white p-1">
                                <ScaledSignature html={previews.get(template.id) ?? ''} />
                            </div>
                            <div className="flex items-center justify-between gap-2 px-1">
                                <div className="flex min-w-0 flex-col">
                                    <span className="truncate text-sm font-medium text-ink">{name}</span>
                                    <span className="truncate text-xs text-muted-foreground">{categoryLabel(template.category)}</span>
                                </div>
                                <span
                                    className={cn(
                                        'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                        isSelected ? 'border-action bg-action text-white' : 'border-line text-transparent group-hover:border-ink/30'
                                    )}
                                >
                                    <Check className="size-3" strokeWidth={3} />
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default StepTemplate
