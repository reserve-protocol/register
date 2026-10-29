import { useId } from 'react'
import { CircleSlash, ThumbsDown, ThumbsUp } from 'lucide-react'

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

const VoteCell = ({
  label,
  value,
  against = false,
}: {
  label: string
  value: string
  against?: boolean
}) => (
  <div className="flex min-w-0 items-center gap-2">
    <span className="hidden [@container(min-width:22rem)]:block">
      <VoteMark
        icon={against ? ThumbsDown : ThumbsUp}
        tone={against ? 'danger' : 'information'}
      />
    </span>
    <div
      className={cn(
        'flex min-w-0 flex-1 items-center justify-between gap-2',
        v1Typography.body
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'font-medium tabular-nums',
          against && roles.feedback.danger.foreground
        )}
      >
        {value}
      </span>
    </div>
  </div>
)

const LoadingVotes = () => (
  <div
    aria-label="Loading record"
    role="status"
    className={cn(
      'grid grid-cols-1 bg-secondary',
      v1LayoutRecipes.seam.subsection
    )}
  >
    <div className="space-y-6 bg-card p-5 sm:p-6">
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
    <div className="space-y-6 bg-card p-5 sm:p-6">
      <div className="grid grid-cols-2 gap-6">
        {[0, 1].map((cell) => (
          <Skeleton key={cell} className="h-6 rounded" />
        ))}
      </div>
      <Skeleton className="h-6 rounded" />
    </div>
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
      <h2 id={headingId} className={cn('mb-4', v1Typography.panelTitle)}>
        {phase === 'final' ? 'Final votes' : 'Current votes'}
      </h2>
      <div
        className={cn(
          'grid grid-cols-1 bg-secondary',
          v1LayoutRecipes.seam.subsection
        )}
      >
        {snapshot.kind === 'loading' ? (
          <LoadingVotes />
        ) : (
          <>
            <div className="space-y-6 bg-card p-5 sm:p-6">
              <ProposalThreshold
                snapshot={snapshot}
                final={phase === 'final'}
              />
              {snapshot.kind === 'standard' && (
                <ProposalMajority majority={snapshot.majority} />
              )}
            </div>
            {snapshot.kind === 'standard' && (
              <div className="space-y-6 bg-card p-5 sm:p-6">
                <div className="grid grid-cols-2 gap-6">
                  <VoteCell label="For" value={snapshot.votes.for} />
                  <VoteCell
                    label="Against"
                    value={snapshot.votes.against}
                    against
                  />
                </div>
                <div
                  className={cn('flex items-center gap-2', v1Typography.body)}
                >
                  <VoteMark icon={CircleSlash} />
                  <span>Abstain</span>
                  <span className="ml-auto font-medium tabular-nums text-supporting-foreground">
                    {snapshot.votes.abstain}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
