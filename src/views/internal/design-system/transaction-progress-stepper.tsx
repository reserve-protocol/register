import { candidateSemanticRoles as semanticRoles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography } from '@/components/design-system-v1/typography'
import {
  LifecycleStatusPill,
  type LifecycleStatusRole,
} from '@/components/lifecycle-status'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

export type TransactionProgressStepState =
  | 'complete'
  | 'active'
  | 'actionable'
  | 'upcoming'
  | 'failed'

export type TransactionProgressStep = {
  label: string
  state: TransactionProgressStepState
  transaction: number
}

const STATE_PRESENTATION = {
  complete: {
    label: 'Complete',
    role: 'success',
    indicator: cn(
      semanticRoles.feedback.success.surface,
      semanticRoles.feedback.success.foreground,
      semanticRoles.feedback.success.border
    ),
  },
  active: {
    label: 'Processing',
    role: 'processing',
    indicator: cn(
      semanticRoles.feedback.information.surface,
      semanticRoles.feedback.information.foreground,
      semanticRoles.feedback.information.border
    ),
  },
  actionable: {
    label: 'Ready',
    role: 'actionable',
    indicator: cn(
      semanticRoles.feedback.warning.surface,
      semanticRoles.feedback.warning.foreground,
      semanticRoles.feedback.warning.border
    ),
  },
  upcoming: {
    label: 'Upcoming',
    role: 'waiting',
    indicator: cn(
      semanticRoles.lifecycle.neutral.surface,
      semanticRoles.lifecycle.neutral.foreground,
      semanticRoles.lifecycle.neutral.border
    ),
  },
  failed: {
    label: 'Failed',
    role: 'unsuccessful',
    indicator: cn(
      semanticRoles.feedback.danger.surface,
      semanticRoles.feedback.danger.foreground,
      semanticRoles.feedback.danger.border
    ),
  },
} satisfies Record<
  TransactionProgressStepState,
  {
    label: string
    role: LifecycleStatusRole
    indicator: string
  }
>

export const TransactionProgressStepper = ({
  label,
  steps,
}: {
  label: string
  steps: readonly TransactionProgressStep[]
}) => (
  <ol
    aria-label={label}
    aria-live="polite"
    data-testid="transaction-progress-stepper"
    className="relative"
  >
    {steps.length > 1 && (
      <span
        aria-hidden="true"
        data-testid="transaction-progress-connector"
        className="absolute bottom-5 left-3 top-5 w-px -translate-x-1/2 bg-border"
      />
    )}
    {steps.map((step) => (
      <li
        key={step.transaction}
        aria-current={
          step.state === 'active' ||
          step.state === 'actionable' ||
          step.state === 'failed'
            ? 'step'
            : undefined
        }
        data-step-state={step.state}
        data-testid="transaction-progress-step"
        className="relative flex items-center gap-2 py-2"
      >
        <TransactionProgressIndicator step={step} />
        <span className="min-w-0 truncate">
          <span className={v1Typography.label}>{step.label}</span>
          <span
            aria-hidden="true"
            data-testid="transaction-progress-position"
            className={cn(
              v1Typography.supporting,
              roles.text.supporting,
              'tabular-nums'
            )}
          >
            {' · '}
            {step.transaction}/{steps.length}
          </span>
          <span className="sr-only">
            , transaction {step.transaction} of {steps.length}
          </span>
        </span>
        <span className="ml-auto shrink-0">
          <LifecycleStatusPill role={STATE_PRESENTATION[step.state].role}>
            {STATE_PRESENTATION[step.state].label}
          </LifecycleStatusPill>
        </span>
      </li>
    ))}
  </ol>
)

const TransactionProgressIndicator = ({
  step,
}: {
  step: TransactionProgressStep
}) => {
  const presentation = STATE_PRESENTATION[step.state]

  return (
    <span
      aria-hidden="true"
      data-testid="transaction-progress-indicator"
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ring-1 ring-inset',
        presentation.indicator
      )}
    >
      {step.state === 'complete' ? (
        <Check className="size-3.5 stroke-[1.5]" />
      ) : step.state === 'active' || step.state === 'actionable' ? (
        <span
          data-testid="transaction-progress-active-dot"
          className="size-2 rounded-full bg-current"
        />
      ) : step.state === 'failed' ? (
        <X className="size-3.5 stroke-[1.5]" />
      ) : (
        <span
          data-testid="transaction-progress-upcoming-dot"
          className="size-2 rounded-full border border-current"
        />
      )}
    </span>
  )
}
