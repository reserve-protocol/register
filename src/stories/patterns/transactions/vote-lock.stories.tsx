import type { Meta, StoryObj } from '@storybook/react-vite'
import { VoteLockProductContext } from './reference/transaction-composition-vote-lock'
import {
  DELEGATION_STATES,
  LOCK_STATES,
  UNLOCK_STATES,
  type VoteLockReviewState,
} from './reference/transaction-composition-vote-lock-support'

const states = [...LOCK_STATES, ...UNLOCK_STATES, ...DELEGATION_STATES]

const meta = {
  title: 'Patterns/Transactions/Vote Lock and Delegation',
  component: VoteLockStory,
  args: { state: 'Lock amount' },
  argTypes: { state: { control: 'select', options: states } },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Vote locking, unlocking and delegation states.',
      },
    },
  },
} satisfies Meta<typeof VoteLockStory>

export default meta
type Story = StoryObj<typeof meta>

export const LockAmount: Story = {}
export const UnlockInitiated: Story = { args: { state: 'Unlock initiated' } }
export const SequentialDelegation: Story = { args: { state: 'Fast signing' } }
export const DelegationUpdated: Story = {
  args: { state: 'Delegation updated' },
}

function VoteLockStory({
  state = 'Lock amount',
}: {
  state: VoteLockReviewState
}) {
  return <VoteLockState key={state} initialState={state} />
}

function VoteLockState({
  initialState,
}: {
  initialState: VoteLockReviewState
}) {
  return <VoteLockProductContext state={initialState} setState={() => {}} />
}
