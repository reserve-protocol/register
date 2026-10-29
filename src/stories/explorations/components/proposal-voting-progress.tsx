import { useId } from 'react'
import {
  CircleSlash,
  ThumbsDown,
  ThumbsUp,
  type LucideIcon,
} from 'lucide-react'

import { Skeleton } from '@/components/design-system-v1/loading'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import {
  proposalVoteSnapshots,
  type ProposalVoteScenario,
  type ProposalVoteSnapshot,
} from './proposal-voting-progress-fixtures'
import {
  VoteMark,
  ProposalThreshold,
  ProposalMajority,
} from './proposal-voting-progress-rows'
import type { ProgressTone } from './progress-indicator-presentation'

type VoteKind = 'for' | 'against' | 'abstain'

const voteCells = {
  for: { label: 'For', icon: ThumbsUp, tone: 'information', value: '' },
  against: {
    label: 'Against',
    icon: ThumbsDown,
    tone: 'danger',
    value: roles.feedback.danger.foreground,
  },
  abstain: {
    label: 'Abstain',
    icon: CircleSlash,
    tone: 'neutral',
    value: 'text-supporting-foreground',
  },
} satisfies Record<
  VoteKind,
  { label: string; icon: LucideIcon; tone: ProgressTone; value: string }
>

const voteGrid =
  'grid grid-cols-2 gap-6 [@container(min-width:32rem)]:grid-cols-3'

const VoteCell = ({ kind, value }: { kind: VoteKind; value: string }) => {
  const cell = voteCells[kind]
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="hidden [@container(min-width:22rem)]:block">
        <VoteMark icon={cell.icon} tone={cell.tone} />
      </span>
      <div
        className={cn(
          'flex min-w-0 flex-1 items-center justify-between gap-2',
          v1Typography.body
        )}
      >
        <span>{cell.label}</span>
        <span className={cn('font-medium tabular-nums', cell.value)}>
          {value}
        </span>
      </div>
    </div>
  )
}

const LoadingCriteria = () => (
  <div aria-label="Loading record" role="status" className="space-y-6">
    {[0, 1].map((row) => (
      <div key={row} className="space-y-3">
        <div className="flex flex-col items-start gap-2 [@container(min-width:24rem)]:flex-row [@container(min-width:24rem)]:justify-between [@container(min-width:24rem)]:gap-4">
          <Skeleton className="h-6 w-36 rounded" />
          <Skeleton className="h-6 w-24 rounded" />
        </div>
        <Skeleton className="h-1" />
      </div>
    ))}
  </div>
)

export const ProposalVotingProgress = ({
  scenario,
  phase,
}: {
  scenario: ProposalVoteScenario
  phase: 'current' | 'final'
}) => {
  const headingId = useId()
  const snapshot: ProposalVoteSnapshot = proposalVoteSnapshots[scenario]
  return (
    <section
      aria-labelledby={headingId}
      aria-busy={snapshot.kind === 'loading'}
      className="mx-auto w-full max-w-xl text-foreground [container-type:inline-size]"
    >
      <div
        className={cn(
          'grid grid-cols-1 bg-secondary',
          v1LayoutRecipes.seam.subsection
        )}
      >
        <div className="space-y-6 bg-card p-5 sm:p-6">
          <h2 id={headingId} className={v1Typography.panelTitle}>
            {phase === 'final' ? 'Final votes' : 'Current votes'}
          </h2>
          {snapshot.kind === 'loading' ? (
            <LoadingCriteria />
          ) : (
            <>
              <ProposalThreshold
                snapshot={snapshot}
                final={phase === 'final'}
              />
              {snapshot.kind === 'standard' && (
                <ProposalMajority majority={snapshot.majority} />
              )}
            </>
          )}
        </div>
        {snapshot.kind === 'loading' ? (
          <div className={cn(voteGrid, 'bg-card p-5 sm:p-6')}>
            {[0, 1, 2].map((cell) => (
              <Skeleton key={cell} className="h-6 rounded" />
            ))}
          </div>
        ) : (
          snapshot.kind === 'standard' && (
            <div className={cn(voteGrid, 'bg-card p-5 sm:p-6')}>
              <VoteCell kind="for" value={snapshot.votes.for} />
              <VoteCell kind="against" value={snapshot.votes.against} />
              <VoteCell kind="abstain" value={snapshot.votes.abstain} />
            </div>
          )
        )}
      </div>
    </section>
  )
}
