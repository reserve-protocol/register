import { useState, type ReactNode } from 'react'

import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

import {
  TransactionSystemPart,
  type TransactionSystemPartStatus,
} from './transaction-system-status'

export type TransactionCompositionState =
  | 'Review'
  | 'Execution'
  | 'Outcome'
  | 'Recovery'

export interface TransactionCompositionStateGroup<State extends string> {
  label: string
  states: readonly State[]
}

export const TransactionCompositionFrame = <
  State extends string = TransactionCompositionState,
>({
  children,
  defaultState,
  description,
  id,
  model,
  parts,
  presentation = 'default',
  stateGroups,
  states,
  title,
}: {
  children: (state: State, setState: (state: State) => void) => ReactNode
  defaultState?: State
  description: string
  id: string
  model: string
  parts: { label: string; status: TransactionSystemPartStatus }[]
  presentation?: 'default' | 'modal-backdrop'
  stateGroups?: readonly TransactionCompositionStateGroup<State>[]
  states?: readonly State[]
  title: string
}) => {
  const reviewStates = (states ??
    TRANSACTION_COMPOSITION_STATES) as readonly State[]
  const reviewStateGroups =
    stateGroups ??
    ([
      { label: 'Review state', states: reviewStates },
    ] as const satisfies readonly TransactionCompositionStateGroup<State>[])
  const firstReviewState = reviewStateGroups[0]?.states[0]
  const hasGroupedStates = reviewStateGroups.length > 1
  const [state, setState] = useState<State>(
    defaultState ?? firstReviewState ?? (reviewStates[0] as State)
  )

  return (
    <article
      data-testid="transaction-family-composition"
      data-composition-id={id}
      id={`transaction-composition-${id}`}
      className={cn(
        'border border-border bg-card',
        presentation === 'modal-backdrop' && '[container-type:inline-size]'
      )}
      aria-labelledby={`transaction-composition-${id}-title`}
    >
      <div data-testid={`transaction-composition-${id}`} className="contents">
        <header
          className={cn(
            'grid gap-4 p-4 sm:p-6',
            !hasGroupedStates &&
              'xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start'
          )}
        >
          <div className={v1LayoutRecipes.stack.tightText}>
            <p className={cn(v1Typography.label, 'text-primary')}>{model}</p>
            <h3
              id={`transaction-composition-${id}-title`}
              className="text-xl font-medium"
            >
              {title}
            </h3>
            <p
              className={cn(
                'max-w-3xl',
                v1Typography.supporting,
                roles.text.supporting
              )}
            >
              {description}
            </p>
          </div>
          <div
            className={cn(
              'grid min-w-0 gap-3',
              !hasGroupedStates && 'xl:justify-items-end'
            )}
          >
            {reviewStateGroups.map((group, groupIndex) => (
              <div
                key={group.label}
                data-testid={`transaction-composition-${id}-state-group-${groupIndex}`}
                className="grid min-w-0 gap-1"
              >
                {hasGroupedStates && (
                  <span
                    className={cn(v1Typography.label, roles.text.supporting)}
                  >
                    {group.label}
                  </span>
                )}
                <div className="max-w-full overflow-x-auto">
                  <SegmentedControl
                    aria-label={`${title} ${group.label.toLowerCase()}`}
                    presentation="text-only"
                    size="compact"
                    width="intrinsic"
                    className="w-max"
                    value={state}
                    onValueChange={(value) => setState(value as State)}
                  >
                    {group.states.map((item, itemIndex) => (
                      <SegmentedControlItem
                        key={item}
                        value={item}
                        data-testid={`transaction-composition-${id}-state-group-${groupIndex}-option-${itemIndex}`}
                      >
                        {item}
                      </SegmentedControlItem>
                    ))}
                  </SegmentedControl>
                </div>
              </div>
            ))}
          </div>
        </header>
        <div
          data-testid={`transaction-composition-${id}-stage`}
          className={cn(
            'border-y border-border',
            presentation === 'modal-backdrop'
              ? 'relative flex h-[980px] items-center justify-center overflow-hidden bg-background p-4 sm:p-6 [@container(min-width:980px)]:h-[760px]'
              : 'bg-secondary p-4 sm:p-6'
          )}
        >
          {presentation === 'modal-backdrop' && (
            <span
              aria-hidden="true"
              data-testid={`transaction-composition-${id}-overlay`}
              className="absolute inset-0 bg-black/50"
            />
          )}
          <div
            className={cn(
              presentation === 'modal-backdrop' && 'relative z-10 w-full'
            )}
          >
            {children(state, setState)}
          </div>
        </div>
        <footer className="flex flex-wrap gap-x-4 gap-y-2 p-4 sm:px-6">
          {parts.map((part) => (
            <TransactionSystemPart key={part.label} {...part} />
          ))}
        </footer>
      </div>
    </article>
  )
}

const TRANSACTION_COMPOSITION_STATES: TransactionCompositionState[] = [
  'Review',
  'Execution',
  'Outcome',
  'Recovery',
]
