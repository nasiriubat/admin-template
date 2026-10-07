import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

export interface StepperStep {
  id: string;
  label: string;
  description?: ReactNode;
  optional?: boolean;
}

export interface StepperProps {
  steps: StepperStep[];
  /** Zero-based index of the active step. Earlier steps count as complete. */
  current: number;
  orientation?: 'horizontal' | 'vertical';
  /** When given, completed steps become buttons so people can go back. */
  onStepClick?: (index: number) => void;
  label?: string;
  className?: string;
}

/** Wizard progress indicator: an ordered list with `aria-current="step"` on the active item. */
export function Stepper({ steps, current, orientation = 'horizontal', onStepClick, label = 'Progress', className }: StepperProps) {
  const vertical = orientation === 'vertical';
  return (
    <ol aria-label={label} className={cn('flex gap-2', vertical ? 'flex-col' : 'flex-row items-start', className)}>
      {steps.map((step, i) => {
        const state = i < current ? 'complete' : i === current ? 'current' : 'upcoming';
        const marker = (
          <span
            aria-hidden="true"
            className={cn(
              'grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold',
              state === 'complete' && 'border-primary bg-primary text-primary-foreground',
              state === 'current' && 'border-primary bg-primary/10 text-primary',
              state === 'upcoming' && 'border-border-strong bg-surface text-text-muted',
            )}
          >
            {state === 'complete' ? <IconRenderer name="Check" className="size-4" /> : i + 1}
          </span>
        );
        const text = (
          <span className={cn('min-w-0 text-left', !vertical && 'hidden sm:block')}>
            <span className={cn('block text-sm font-medium', state === 'upcoming' ? 'text-text-muted' : 'text-text')}>
              {step.label}
              {step.optional && <span className="ml-1.5 text-xs font-normal text-text-muted">(optional)</span>}
            </span>
            {step.description && <span className="block text-xs text-text-muted">{step.description}</span>}
          </span>
        );
        const status = <span className="sr-only">{state === 'complete' ? ' (completed)' : state === 'current' ? ' (current step)' : ' (not started)'}</span>;
        const clickable = Boolean(onStepClick) && state === 'complete';
        const inner = (
          <>
            {marker}
            {text}
            {status}
          </>
        );
        return (
          <li
            key={step.id}
            aria-current={state === 'current' ? 'step' : undefined}
            className={cn('flex min-w-0 items-center', !vertical && i < steps.length - 1 && 'flex-1', vertical && 'relative')}
          >
            {clickable ? (
              <button type="button" onClick={() => onStepClick?.(i)} className="flex items-center gap-3 rounded-md py-1 [@media(pointer:coarse)]:min-h-11">
                {inner}
              </button>
            ) : (
              <span className="flex items-center gap-3 py-1">{inner}</span>
            )}
            {!vertical && i < steps.length - 1 && (
              <span aria-hidden="true" className={cn('mx-3 h-px min-w-4 flex-1', i < current ? 'bg-primary' : 'bg-border')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
