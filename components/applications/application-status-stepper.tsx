'use client';

import { ApplicationStatus } from '@/components/mock/data';
import { cn } from '@/lib/utils';

type StepKey =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEWED'
  | 'DECISION';

interface Step {
  key: StepKey;
  label: string;
}

const STEPS: Step[] = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Under review' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview scheduled' },
  { key: 'INTERVIEWED', label: 'Interviewed' },
  { key: 'DECISION', label: 'Decision' },
];

type Tone = 'default' | 'success' | 'danger' | 'neutral';

function getCurrentStepIndex(status: ApplicationStatus): number {
  switch (status) {
    case 'DRAFT':
      return -1;
    case 'SUBMITTED':
      return 0;
    case 'UNDER_REVIEW':
      return 1;
    case 'INTERVIEW_SCHEDULED':
      return 2;
    case 'INTERVIEWED':
      return 3;
    case 'APPROVED':
    case 'REJECTED':
    case 'WITHDRAWN':
    case 'LAPSED':
      return 4;
  }
}

function getDecisionLabel(status: ApplicationStatus): string {
  switch (status) {
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'WITHDRAWN':
      return 'Withdrawn';
    case 'LAPSED':
      return 'Lapsed';
    default:
      return 'Decision';
  }
}

function getDecisionTone(status: ApplicationStatus): Tone {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'danger';
  if (status === 'WITHDRAWN' || status === 'LAPSED') return 'neutral';
  return 'default';
}

interface ApplicationStatusStepperProps {
  status: ApplicationStatus;
  /** Set true when a rejected application was reopened by SUPER_ADMIN */
  reopened?: boolean;
  className?: string;
}

export function ApplicationStatusStepper({
  status,
  reopened,
  className,
}: ApplicationStatusStepperProps) {
  const currentIndex = getCurrentStepIndex(status);
  const isTerminal = (
    ['APPROVED', 'REJECTED', 'WITHDRAWN', 'LAPSED'] as ApplicationStatus[]
  ).includes(status);
  const decisionTone = getDecisionTone(status);

  return (
    <nav aria-label="Application status" className={cn('w-full', className)}>
      <ol className="flex w-full items-start">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isUpcoming = i > currentIndex;
          const isDecisionStep = step.key === 'DECISION';
          const isDecisionFinal = isDecisionStep && isTerminal;

          const dotClass = cn(
            'shrink-0 w-3 h-3 rounded-full border-2 flex items-center justify-center',
            'transition-all duration-200',
            isCompleted && 'bg-primary border-primary',
            isCurrent &&
              !isDecisionFinal &&
              'bg-primary border-primary ring-4 ring-primary/15',
            isCurrent &&
              isDecisionFinal &&
              decisionTone === 'success' &&
              'bg-success border-success ring-4 ring-success/15',
            isCurrent &&
              isDecisionFinal &&
              decisionTone === 'danger' &&
              'bg-danger border-danger ring-4 ring-danger/15',
            isCurrent &&
              isDecisionFinal &&
              decisionTone === 'neutral' &&
              'bg-ink-400 border-ink-400 ring-4 ring-ink-400/15',
            isUpcoming && 'bg-paper border-border',
          );

          const label = isDecisionStep && isTerminal
            ? getDecisionLabel(status)
            : step.label;

          const labelClass = cn(
            'text-xs font-medium truncate',
            isCompleted && 'text-primary',
            isCurrent && !isDecisionFinal && 'text-primary',
            isCurrent &&
              isDecisionFinal &&
              decisionTone === 'success' &&
              'text-success',
            isCurrent &&
              isDecisionFinal &&
              decisionTone === 'danger' &&
              'text-danger',
            isCurrent &&
              isDecisionFinal &&
              decisionTone === 'neutral' &&
              'text-fg-muted',
            isUpcoming && 'text-fg-subtle',
          );

          return (
            <li
              key={step.key}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex flex-1 flex-col gap-2 min-w-0"
            >
              <div className="flex items-center w-full">
                <span aria-hidden="true" className={dotClass}>
                  {isCompleted && (
                    <svg
                      width="6"
                      height="6"
                      viewBox="0 0 6 6"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 3l1.5 1.5L5 1.5"
                        stroke="white"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>

                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-0.5 flex-1 min-w-2 mx-1.5 transition-colors duration-200',
                      isCompleted ? 'bg-primary' : 'bg-border',
                    )}
                  />
                )}
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <span className={labelClass}>{label}</span>

                {reopened && status === 'UNDER_REVIEW' && isCurrent && (
                  <span
                    className={cn(
                      'inline-flex w-fit items-center rounded-full px-1.5 py-0.5',
                      'text-[10px] font-semibold uppercase tracking-wide',
                      'bg-dawn-100 text-dawn-800',
                    )}
                  >
                    Reopened
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

ApplicationStatusStepper.displayName = 'ApplicationStatusStepper';