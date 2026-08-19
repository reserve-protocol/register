import type { ProposalStage } from '@/components/proposal-status-bar'
import type {
  LifecycleStatusIndicator,
  LifecycleStatusRole,
} from '@/components/lifecycle-status'

export type ProposalStateKey =
  | 'pending'
  | 'active'
  | 'optimistic-active'
  | 'contested-active'
  | 'standard-succeeded'
  | 'queued'
  | 'optimistic-succeeded'
  | 'executed'
  | 'defeated'
  | 'quorum-not-reached'
  | 'canceled'

export type ProposalQualifier = 'fast' | 'contested'
export type ProposalProgressEmphasis = 'strong' | 'standard' | 'quiet'

interface ProposalStatus {
  label: string
  role: LifecycleStatusRole
  indicator?: LifecycleStatusIndicator
}

interface ProposalVotes {
  for: string
  against: string
  abstain: string
  leading?: 'for' | 'against' | 'abstain'
}

export type ProposalDecisionEvidence =
  | {
      kind: 'standard'
      thresholdValue: string
      votes: ProposalVotes
    }
  | {
      kind: 'optimistic'
      thresholdValue: string
      detail: string
    }
  | {
      kind: 'none'
      summary: string
    }

export interface GovernanceProposalFixture {
  state: ProposalStateKey
  title: string
  kind: 'standard' | 'optimistic'
  qualifier?: ProposalQualifier
  statuses: ProposalStatus[]
  countdown?: string
  stages: ProposalStage[]
  progressEmphasis: ProposalProgressEmphasis
  evidence: ProposalDecisionEvidence
}

const STANDARD_ACTIVE_STAGES: ProposalStage[] = [
  { key: 'proposal', duration: 2, status: 'completed' },
  { key: 'voting', duration: 5, status: 'in-progress', progress: 0.62 },
  { key: 'execution', duration: 3, status: 'pending' },
]

const STANDARD_DECIDED_STAGES: ProposalStage[] = [
  { key: 'proposal', duration: 2, status: 'completed' },
  { key: 'voting', duration: 5, status: 'completed' },
  { key: 'execution', duration: 3, status: 'pending' },
]

export const CURRENT_PROPOSAL_FIXTURES: GovernanceProposalFixture[] = [
  {
    state: 'pending',
    title: 'Extend the voting period for Basket Governance',
    kind: 'standard',
    statuses: [{ label: 'Voting pending', role: 'waiting' }],
    countdown: 'Starts in 18h',
    stages: [
      {
        key: 'proposal',
        duration: 2,
        status: 'in-progress',
        progress: 0.42,
      },
      { key: 'voting', duration: 5, status: 'pending' },
      { key: 'execution', duration: 3, status: 'pending' },
    ],
    progressEmphasis: 'standard',
    evidence: { kind: 'none', summary: 'Voting has not started' },
  },
  {
    state: 'active',
    title: 'Update Wrapped TONCOIN Basket Component',
    kind: 'standard',
    statuses: [{ label: 'Voting active', role: 'active', indicator: 'voting' }],
    countdown: 'Ends in 6h',
    stages: STANDARD_ACTIVE_STAGES,
    progressEmphasis: 'strong',
    evidence: {
      kind: 'standard',
      thresholdValue: '68% of required',
      votes: { for: '61%', against: '32%', abstain: '7%', leading: 'for' },
    },
  },
  {
    state: 'optimistic-active',
    title: 'Fast-track the emergency oracle update',
    kind: 'optimistic',
    qualifier: 'fast',
    statuses: [
      { label: 'Challenge active', role: 'active', indicator: 'challenge' },
    ],
    countdown: 'Ends in 11h',
    stages: [
      { key: 'voting', duration: 5, status: 'in-progress', progress: 0.48 },
    ],
    progressEmphasis: 'strong',
    evidence: {
      kind: 'optimistic',
      thresholdValue: '32% of threshold',
      detail: '0.8M of 2.5M vlRSR',
    },
  },
  {
    state: 'contested-active',
    title:
      '[Reproposal] Extension of onchain voting and execution process of Basket Governance',
    kind: 'standard',
    qualifier: 'contested',
    statuses: [{ label: 'Voting active', role: 'active', indicator: 'voting' }],
    countdown: 'Ends in 2d',
    stages: STANDARD_ACTIVE_STAGES,
    progressEmphasis: 'strong',
    evidence: {
      kind: 'standard',
      thresholdValue: 'Reached',
      votes: { for: '73%', against: '22%', abstain: '5%', leading: 'for' },
    },
  },
  {
    state: 'standard-succeeded',
    title: 'July 2026 Governance Parameter Update',
    kind: 'standard',
    statuses: [
      { label: 'Passed', role: 'success' },
      { label: 'Ready to queue', role: 'actionable' },
    ],
    stages: STANDARD_DECIDED_STAGES,
    progressEmphasis: 'standard',
    evidence: {
      kind: 'standard',
      thresholdValue: 'Reached',
      votes: { for: '82%', against: '14%', abstain: '4%', leading: 'for' },
    },
  },
  {
    state: 'queued',
    title: 'September 2026 Rebalance',
    kind: 'standard',
    statuses: [
      { label: 'Passed', role: 'success' },
      { label: 'Pending execution', role: 'waiting' },
    ],
    countdown: 'Ready in 8h',
    stages: [
      { key: 'proposal', duration: 2, status: 'completed' },
      { key: 'voting', duration: 5, status: 'completed' },
      {
        key: 'execution',
        duration: 3,
        status: 'in-progress',
        progress: 0.58,
      },
    ],
    progressEmphasis: 'standard',
    evidence: {
      kind: 'standard',
      thresholdValue: 'Reached',
      votes: { for: '91%', against: '7%', abstain: '2%', leading: 'for' },
    },
  },
  {
    state: 'optimistic-succeeded',
    title: 'Fast-track the emergency basket update',
    kind: 'optimistic',
    qualifier: 'fast',
    statuses: [
      { label: 'Passed', role: 'success' },
      { label: 'Ready to execute', role: 'actionable' },
    ],
    stages: [{ key: 'voting', duration: 5, status: 'completed' }],
    progressEmphasis: 'standard',
    evidence: {
      kind: 'optimistic',
      thresholdValue: '32% of threshold',
      detail: 'Challenge period ended',
    },
  },
]

export const HISTORICAL_PROPOSAL_FIXTURES: GovernanceProposalFixture[] = [
  {
    state: 'executed',
    title: 'August 2026 Rebalance',
    kind: 'standard',
    statuses: [{ label: 'Executed', role: 'success' }],
    stages: [
      { key: 'proposal', duration: 2, status: 'completed' },
      { key: 'voting', duration: 5, status: 'completed' },
      { key: 'execution', duration: 3, status: 'completed' },
    ],
    progressEmphasis: 'quiet',
    evidence: {
      kind: 'standard',
      thresholdValue: 'Reached',
      votes: { for: '100%', against: '0%', abstain: '0%', leading: 'for' },
    },
  },
  {
    state: 'defeated',
    title: 'Reduce the ETH+ allocation target',
    kind: 'standard',
    statuses: [{ label: 'Voted down', role: 'unsuccessful' }],
    stages: STANDARD_DECIDED_STAGES,
    progressEmphasis: 'quiet',
    evidence: {
      kind: 'standard',
      thresholdValue: 'Reached',
      votes: { for: '39%', against: '58%', abstain: '3%', leading: 'against' },
    },
  },
  {
    state: 'quorum-not-reached',
    title: 'Update the governance proposal threshold',
    kind: 'standard',
    statuses: [{ label: 'Quorum not reached', role: 'unsuccessful' }],
    stages: STANDARD_DECIDED_STAGES,
    progressEmphasis: 'quiet',
    evidence: {
      kind: 'standard',
      thresholdValue: '74% of required',
      votes: { for: '79%', against: '17%', abstain: '4%' },
    },
  },
  {
    state: 'canceled',
    title: 'Replace the deprecated basket component',
    kind: 'standard',
    statuses: [{ label: 'Canceled', role: 'closed' }],
    stages: STANDARD_DECIDED_STAGES,
    progressEmphasis: 'quiet',
    evidence: { kind: 'none', summary: 'No final vote' },
  },
]
