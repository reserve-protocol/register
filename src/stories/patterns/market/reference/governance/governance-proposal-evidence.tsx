import { Ban, ThumbsDown, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import type { ProposalDecisionEvidence } from './governance-proposal-state-fixtures'

export const DecisionEvidence = ({
  evidence,
}: {
  evidence: ProposalDecisionEvidence
}) => {
  if (evidence.kind === 'none') {
    return (
      <span className="font-light text-muted-foreground">
        {evidence.summary}
      </span>
    )
  }

  if (evidence.kind === 'optimistic') {
    return (
      <div
        data-decision-evidence="challenge"
        className={cn(
          'flex flex-wrap items-center font-light tabular-nums',
          v1LayoutRecipes.cluster.internalRegions
        )}
      >
        <EvidenceValue label="Challenge" value={evidence.thresholdValue} />
        <span className="text-muted-foreground">{evidence.detail}</span>
      </div>
    )
  }

  return (
    <div
      data-decision-evidence="standard"
      className={cn(
        'flex flex-wrap items-start tabular-nums [@container(min-width:28rem)]:items-center',
        v1LayoutRecipes.cluster.internalRegions
      )}
    >
      <EvidenceValue
        label="Quorum"
        value={evidence.thresholdValue}
        stackOnNarrow
      />
      <span
        aria-hidden="true"
        data-testid="proposal-evidence-divider"
        className={cn(
          'hidden h-4 w-px shrink-0 [@container(min-width:28rem)]:block',
          roles.line.divider
        )}
      />
      <div className="flex flex-col gap-1">
        <span className="font-light text-muted-foreground [@container(min-width:28rem)]:hidden">
          Votes
        </span>
        <div
          data-testid="proposal-vote-distribution"
          className={cn(
            'flex items-center',
            v1LayoutRecipes.cluster.relatedContent
          )}
          aria-label={`${evidence.votes.for} for, ${evidence.votes.against} against, ${evidence.votes.abstain} abstained`}
        >
          <VoteValue
            icon={<ThumbsUp />}
            value={evidence.votes.for}
            emphasized={evidence.votes.leading === 'for'}
          />
          <VoteValue
            icon={<ThumbsDown />}
            value={evidence.votes.against}
            emphasized={evidence.votes.leading === 'against'}
          />
          <VoteValue
            icon={<Ban />}
            value={evidence.votes.abstain}
            emphasized={evidence.votes.leading === 'abstain'}
          />
        </div>
      </div>
    </div>
  )
}

const EvidenceValue = ({
  label,
  value,
  stackOnNarrow = false,
}: {
  label: string
  value: string
  stackOnNarrow?: boolean
}) => (
  <span
    data-testid="proposal-evidence-value"
    className={cn(
      'flex shrink-0',
      stackOnNarrow
        ? 'flex-col items-start [@container(min-width:28rem)]:flex-row [@container(min-width:28rem)]:items-center'
        : 'items-center',
      v1LayoutRecipes.cluster.tightText
    )}
  >
    <span className="font-light text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </span>
)

const VoteValue = ({
  icon,
  value,
  emphasized = false,
}: {
  icon: React.ReactElement
  value: string
  emphasized?: boolean
}) => (
  <span
    data-testid="proposal-vote-value"
    data-vote-emphasized={emphasized ? 'true' : 'false'}
    className={cn(
      'flex items-center font-light',
      v1LayoutRecipes.cluster.tightText,
      emphasized ? 'font-medium text-foreground' : 'text-muted-foreground'
    )}
  >
    <span className="[&>svg]:size-4 [&>svg]:stroke-[1.5]">{icon}</span>
    {value}
  </span>
)
