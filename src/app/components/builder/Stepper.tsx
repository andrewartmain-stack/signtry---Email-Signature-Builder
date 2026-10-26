import React, { FC } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import { BUILDER_STEPS, BuilderStepId } from '../../utils/signatureDesign'

// Step list across the top of the builder. Every step can be opened
// directly; steps with problems get a dot so they are easy to find.
const Stepper: FC<{
    current: BuilderStepId;
    visited: Set<BuilderStepId>;
    stepsWithIssues: Set<BuilderStepId>;
    onSelect: (step: BuilderStepId) => void;
}> = ({ current, visited, stepsWithIssues, onSelect }) => {
    const currentIndex = BUILDER_STEPS.findIndex(step => step.id === current);

    return (
        <nav aria-label="Builder steps" className="scrollable-x -mx-4 px-4 md:mx-0 md:px-0">
            <ol className="flex w-max min-w-full items-center gap-1 rounded-full border border-line bg-card p-1.5">
                {BUILDER_STEPS.map((step, index) => {
                    const isCurrent = step.id === current;
                    const isDone = !isCurrent && visited.has(step.id) && index < currentIndex;
                    const hasIssue = stepsWithIssues.has(step.id) && visited.has(step.id) && !isCurrent;

                    return (
                        <li key={step.id} className="flex flex-1">
                            <button
                                type="button"
                                onClick={() => onSelect(step.id)}
                                aria-current={isCurrent ? 'step' : undefined}
                                className={cn(
                                    'relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-action/35',
                                    isCurrent ? 'bg-ink text-white' : 'text-muted-foreground hover:bg-ink/[0.05] hover:text-ink'
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex size-5 items-center justify-center rounded-full text-[11px] font-semibold',
                                        isCurrent ? 'bg-white text-ink' : isDone ? 'bg-ink text-white' : 'bg-ink/[0.08] text-muted-foreground'
                                    )}
                                >
                                    {isDone ? <Check className="size-3" strokeWidth={3} /> : index + 1}
                                </span>
                                {step.label}
                                {hasIssue && <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-destructive" aria-label="needs attention" />}
                            </button>
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}

export default Stepper
