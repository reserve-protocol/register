import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { useState } from 'react'

import {
  type ZapperReviewState,
  ZapperInlineReference,
} from './transaction-composition-rfq'
import { VoteLockProductContext } from './transaction-composition-vote-lock'
import type { VoteLockReviewState } from './transaction-composition-vote-lock-support'

type PairedReviewState =
  | 'Editable'
  | 'Submitted'
  | 'Immediate result'
  | 'Delayed initiation'

const REVIEW_STATES = [
  'Editable',
  'Submitted',
  'Immediate result',
  'Delayed initiation',
] as const satisfies readonly PairedReviewState[]

const REVIEW_CASES: Record<
  PairedReviewState,
  {
    zapper: ZapperReviewState
    voteLock: VoteLockReviewState
    note: string
  }
> = {
  Editable: {
    zapper: 'Review',
    voteLock: 'Lock amount',
    note: 'Compare editable amount hierarchy, asset identity, balance action, direction, facts, and primary action.',
  },
  Submitted: {
    zapper: 'Atomic confirmation',
    voteLock: 'Lock confirming',
    note: 'Compare the same submitted-task geometry while preserving route-specific transaction language.',
  },
  'Immediate result': {
    zapper: 'Atomic outcome',
    voteLock: 'Locked',
    note: 'Both actions are complete, so finalized value hierarchy and completion treatment should converge.',
  },
  'Delayed initiation': {
    zapper: 'Atomic outcome',
    voteLock: 'Unlock initiated',
    note: 'The Zapper result repeats as the immediate-result reference. Unlock must show successful initiation without implying that RSR has already been received.',
  },
}

export const TransactionPairedReview = () => {
  const [reviewState, setReviewState] = useState<PairedReviewState>('Editable')
  const reviewCase = REVIEW_CASES[reviewState]

  return (
    <section
      data-testid="transaction-paired-review"
      className={v1LayoutRecipes.stack.completeGroups}
      aria-labelledby="transaction-paired-review-title"
    >
      <header className={v1LayoutRecipes.stack.tightText}>
        <p className={cn(v1Typography.label, 'text-primary')}>
          Focused cross-family review
        </p>
        <h3
          id="transaction-paired-review-title"
          className="text-xl font-medium"
        >
          Instant Zapper and Vote Lock
        </h3>
        <p
          className={cn(
            'max-w-4xl',
            v1Typography.supporting,
            roles.text.supporting
          )}
        >
          Judge the shared compositional job directly before deciding which
          differences belong to lifecycle truth or flow-specific mechanics.
          These comparisons remain provisional and do not authorize either flow
          to become the other&apos;s design authority.
        </p>
      </header>

      <div className="overflow-x-auto pb-1">
        <SegmentedControl
          aria-label="Paired transaction review state"
          presentation="contained"
          size="compact"
          width="intrinsic"
          value={reviewState}
          onValueChange={(value) => setReviewState(value as PairedReviewState)}
        >
          {REVIEW_STATES.map((state) => (
            <SegmentedControlItem key={state} value={state}>
              {state}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>

      <p className={cn(v1Typography.supporting, roles.text.supporting)}>
        {reviewCase.note}
      </p>

      <div className="grid gap-4 xl:grid-cols-2">
        <ReviewStage title="Instant Zapper">
          <div
            key={`zapper-${reviewState}`}
            data-testid="paired-zapper-stage"
            className="relative flex min-h-[720px] items-center justify-center overflow-hidden bg-black/50 p-4"
          >
            <ZapperInlineReference state={reviewCase.zapper} />
          </div>
        </ReviewStage>

        <ReviewStage title="Vote Lock / Unlock">
          <div
            key={`vote-lock-${reviewState}`}
            data-testid="paired-vote-lock-stage"
          >
            <PairedVoteLockStage initialState={reviewCase.voteLock} />
          </div>
        </ReviewStage>
      </div>
    </section>
  )
}

const ReviewStage = ({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) => (
  <article className="min-w-0 overflow-hidden border border-border bg-card">
    <header className="border-b border-border px-4 py-3">
      <h4 className={v1Typography.label}>{title}</h4>
    </header>
    {children}
  </article>
)

const PairedVoteLockStage = ({
  initialState,
}: {
  initialState: VoteLockReviewState
}) => {
  const [state, setState] = useState(initialState)

  return <VoteLockProductContext state={state} setState={setState} />
}
