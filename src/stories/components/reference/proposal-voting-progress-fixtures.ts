type ThresholdReading = {
  percent: number | null
  current: string
  target: string | null
  reached: boolean
}

type StandardVotes = {
  kind: 'standard'
  threshold: ThresholdReading
  majority: {
    outcome: 'supported' | 'opposed' | 'tied'
    forPercent: number
  } | null
  votes: { for: string; against: string; abstain: string }
}

export type ProposalVoteSnapshot =
  | StandardVotes
  | { kind: 'optimistic'; threshold: ThresholdReading }
  | { kind: 'loading' }

export const proposalVoteSnapshots = {
  unanimous: {
    kind: 'standard',
    threshold: {
      percent: 100,
      current: '87.91M',
      target: '11.34M',
      reached: true,
    },
    majority: { outcome: 'supported', forPercent: 100 },
    votes: { for: '88M', against: '0', abstain: '0' },
  },
  'no-votes': {
    kind: 'standard',
    threshold: { percent: 0, current: '0', target: '10M', reached: false },
    majority: null,
    votes: { for: '0', against: '0', abstain: '0' },
  },
  'early-voting': {
    kind: 'standard',
    threshold: { percent: 1, current: '100K', target: '10M', reached: false },
    majority: { outcome: 'supported', forPercent: 100 },
    votes: { for: '50K', against: '0', abstain: '50K' },
  },
  partial: {
    kind: 'standard',
    threshold: { percent: 40, current: '4M', target: '10M', reached: false },
    majority: { outcome: 'supported', forPercent: 60 },
    votes: { for: '3M', against: '2M', abstain: '1M' },
  },
  'quorum-reached': {
    kind: 'standard',
    threshold: { percent: 100, current: '10M', target: '10M', reached: true },
    majority: { outcome: 'supported', forPercent: 90 },
    votes: { for: '9M', against: '1M', abstain: '1M' },
  },
  'near-quorum': {
    kind: 'standard',
    threshold: { percent: 99, current: '99M', target: '100M', reached: false },
    majority: { outcome: 'supported', forPercent: 60 },
    votes: { for: '60M', against: '40M', abstain: '39M' },
  },
  'narrow-majority': {
    kind: 'standard',
    threshold: { percent: 100, current: '100M', target: '100M', reached: true },
    majority: { outcome: 'supported', forPercent: 51 },
    votes: { for: '51M', against: '49M', abstain: '49M' },
  },
  opposed: {
    kind: 'standard',
    threshold: { percent: 100, current: '10M', target: '10M', reached: true },
    majority: { outcome: 'opposed', forPercent: 40 },
    votes: { for: '4M', against: '6M', abstain: '6M' },
  },
  'unanimous-opposition': {
    kind: 'standard',
    threshold: { percent: 100, current: '10M', target: '10M', reached: true },
    majority: { outcome: 'opposed', forPercent: 0 },
    votes: { for: '0', against: '10M', abstain: '10M' },
  },
  tie: {
    kind: 'standard',
    threshold: { percent: 100, current: '10M', target: '10M', reached: true },
    majority: { outcome: 'tied', forPercent: 50 },
    votes: { for: '5M', against: '5M', abstain: '5M' },
  },
  'abstain-only': {
    kind: 'standard',
    threshold: { percent: 30, current: '3M', target: '10M', reached: false },
    majority: null,
    votes: { for: '0', against: '0', abstain: '3M' },
  },
  'target-unavailable': {
    kind: 'standard',
    threshold: { percent: null, current: '4M', target: null, reached: false },
    majority: { outcome: 'supported', forPercent: 60 },
    votes: { for: '3M', against: '2M', abstain: '1M' },
  },
  'optimistic-challenge': {
    kind: 'optimistic',
    threshold: { percent: 35, current: '3.5M', target: '10M', reached: false },
  },
  'optimistic-no-challenges': {
    kind: 'optimistic',
    threshold: { percent: 0, current: '0', target: '10M', reached: false },
  },
  'optimistic-threshold-reached': {
    kind: 'optimistic',
    threshold: { percent: 100, current: '12M', target: '10M', reached: true },
  },
  'optimistic-target-unavailable': {
    kind: 'optimistic',
    threshold: { percent: null, current: '3.5M', target: null, reached: false },
  },
  loading: { kind: 'loading' },
} satisfies Record<string, ProposalVoteSnapshot>

export type ProposalVoteScenario = keyof typeof proposalVoteSnapshots
