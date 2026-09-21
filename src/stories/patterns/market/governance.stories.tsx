import type { Meta, StoryObj } from '@storybook/react-vite'

import { GovernanceProposalRecord } from './reference/governance/governance-proposal-record'
import {
  CURRENT_PROPOSAL_FIXTURES,
  HISTORICAL_PROPOSAL_FIXTURES,
  type ProposalStateKey,
} from './reference/governance/governance-proposal-state-fixtures'

const proposals = [
  ...CURRENT_PROPOSAL_FIXTURES,
  ...HISTORICAL_PROPOSAL_FIXTURES,
]

const GovernanceReference = ({ state }: { state: ProposalStateKey }) => {
  const record = proposals.find((proposal) => proposal.state === state)
  if (!record) return null
  return (
    <div className="mx-auto w-full max-w-3xl bg-card">
      <GovernanceProposalRecord record={record} />
    </div>
  )
}

const states = proposals.map((proposal) => proposal.state)

const meta = {
  title: 'Patterns/Market/Governance records',
  component: GovernanceReference,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Standard and optimistic governance proposals.',
      },
    },
  },
  args: { state: 'active' },
  argTypes: { state: { control: 'select', options: states } },
} satisfies Meta<typeof GovernanceReference>

export default meta
type Story = StoryObj<typeof meta>

export const VotingActive: Story = {}
export const Pending: Story = { args: { state: 'pending' } }
export const OptimisticChallenge: Story = {
  args: { state: 'optimistic-active' },
}
export const Contested: Story = { args: { state: 'contested-active' } }
export const ReadyToQueue: Story = { args: { state: 'standard-succeeded' } }
export const WaitingPeriod: Story = { args: { state: 'queued' } }
export const ReadyToExecute: Story = { args: { state: 'queued-ready' } }
export const OptimisticReady: Story = {
  args: { state: 'optimistic-succeeded' },
}
export const Executed: Story = { args: { state: 'executed' } }
export const Defeated: Story = { args: { state: 'defeated' } }
export const QuorumNotReached: Story = {
  args: { state: 'quorum-not-reached' },
}
export const Canceled: Story = { args: { state: 'canceled' } }
export const Expired: Story = { args: { state: 'expired' } }
