import ProposalStatusBar from '@/components/proposal-status-bar'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { cn } from '@/lib/utils'
import { Ban, Shield, ThumbsDown, ThumbsUp, Zap } from 'lucide-react'
import { candidateSemanticRoles as roles } from './candidate-semantic-roles'
import {
  CURRENT_PROPOSAL_FIXTURES,
  HISTORICAL_PROPOSAL_FIXTURES,
  type GovernanceProposalFixture,
  type ProposalDecisionEvidence,
  type ProposalQualifier,
} from './governance-proposal-state-fixtures'
import { LifecycleStatusPill } from '@/components/lifecycle-status'

const GOVERNANCE_ROUTE = '/bsc/index-dtf/cmc20/governance'

const GovernanceProposalStateReview = ({
  reviewScope,
}: {
  reviewScope: React.ReactNode
}) => (
  <section
    aria-labelledby="proposal-record-review-title"
    className={v1LayoutRecipes.stack.internalRegions}
  >
    <div className={v1LayoutRecipes.stack.tightText}>
      <h3
        id="proposal-record-review-title"
        className="text-sm font-medium text-foreground"
      >
        Governance proposal records
      </h3>
      <p className="max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        Real proposal behavior is mapped across standard, fast optimistic, and
        contested flows. Titles preserve real product density; fixtures simulate
        state branches that are not simultaneously available in local data.
      </p>
    </div>

    <div
      className={cn(
        'grid xl:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]',
        v1LayoutRecipes.cluster.internalRegions
      )}
    >
      <div className={cn('max-w-3xl', v1LayoutRecipes.stack.completeGroups)}>
        <ProposalStateGroup
          title="Current and actionable"
          records={CURRENT_PROPOSAL_FIXTURES}
        />
        <ProposalStateGroup
          title="Historical and closed"
          records={HISTORICAL_PROPOSAL_FIXTURES}
        />
      </div>
      {reviewScope}
    </div>
  </section>
)

const ProposalStateGroup = ({
  title,
  records,
}: {
  title: string
  records: GovernanceProposalFixture[]
}) => (
  <div className={v1LayoutRecipes.stack.relatedContent}>
    <p className="text-sm font-medium text-foreground">{title}</p>
    <div className="space-y-px bg-secondary">
      {records.map((record) => (
        <GovernanceProposalRecord key={record.state} record={record} />
      ))}
    </div>
  </div>
)

const GovernanceProposalRecord = ({
  record,
}: {
  record: GovernanceProposalFixture
}) => (
  <a
    data-testid="rich-record"
    data-record-kind="governance"
    data-proposal-state={record.state}
    data-proposal-kind={record.kind}
    data-progress-emphasis={record.progressEmphasis}
    href={GOVERNANCE_ROUTE}
    target="_blank"
    rel="noreferrer"
    className={cn(
      'group block bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
      v1LayoutRecipes.inset.ordinaryContent,
      v1LayoutRecipes.stack.internalRegions
    )}
  >
    <div
      className={cn(
        'flex items-start justify-between',
        v1LayoutRecipes.cluster.internalRegions
      )}
    >
      <h4 className="text-base font-medium leading-6 group-hover:text-primary">
        {record.title}
      </h4>
      {record.qualifier && (
        <ProposalQualifierLabel qualifier={record.qualifier} />
      )}
    </div>

    <div>
      <ProposalStatusBar
        className="!h-1 [&>svg]:!h-1"
        stages={record.stages}
        tone={record.progressEmphasis === 'quiet' ? 'historical' : 'current'}
      />
    </div>

    <div
      className={cn(
        'flex flex-wrap items-center justify-between text-sm leading-5',
        v1LayoutRecipes.cluster.internalRegions
      )}
    >
      <div
        className={cn(
          'flex flex-wrap items-center',
          v1LayoutRecipes.cluster.relatedContent
        )}
      >
        {record.statuses.map((status) => (
          <LifecycleStatusPill
            key={status.label}
            role={status.role}
            indicator={status.indicator}
          >
            {status.label}
          </LifecycleStatusPill>
        ))}
        {record.countdown && (
          <LifecycleStatusPill role="waiting">
            {record.countdown}
          </LifecycleStatusPill>
        )}
      </div>
      <DecisionEvidence evidence={record.evidence} />
    </div>
  </a>
)

const ProposalQualifierLabel = ({
  qualifier,
}: {
  qualifier: ProposalQualifier
}) => {
  const isFast = qualifier === 'fast'
  return (
    <span
      data-proposal-qualifier={qualifier}
      className={cn(
        'flex shrink-0 items-center text-sm font-medium leading-5 text-muted-foreground',
        v1LayoutRecipes.cluster.tightText
      )}
    >
      {isFast ? (
        <Zap className="size-3.5 stroke-[1.5]" />
      ) : (
        <Shield className="size-3.5 stroke-[1.5]" />
      )}
      {isFast ? 'Fast' : 'Contested'}
    </span>
  )
}

const DecisionEvidence = ({
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
        'flex flex-wrap items-center tabular-nums',
        v1LayoutRecipes.cluster.internalRegions
      )}
    >
      <EvidenceValue label="Quorum" value={evidence.thresholdValue} />
      <span
        aria-hidden="true"
        data-testid="proposal-evidence-divider"
        className={cn('h-4 w-px shrink-0', roles.line.divider)}
      />
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
  )
}

const EvidenceValue = ({ label, value }: { label: string; value: string }) => (
  <span
    data-testid="proposal-evidence-value"
    className={cn('flex items-center', v1LayoutRecipes.cluster.tightText)}
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

export default GovernanceProposalStateReview
