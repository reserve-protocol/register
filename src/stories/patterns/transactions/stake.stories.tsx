import type { Meta, StoryObj } from '@storybook/react-vite'
import { StakeProductContext } from './reference/transaction-composition-stake'
import {
  STAKE_DELEGATE_STATES,
  STAKE_RECOVERY_STATES,
  STAKE_STATES,
  UNSTAKE_STATES,
  type StakeReviewState,
} from './reference/transaction-composition-stake-support'

const states = [
  ...STAKE_STATES,
  ...UNSTAKE_STATES,
  ...STAKE_DELEGATE_STATES,
  ...STAKE_RECOVERY_STATES,
]

const meta = {
  title: 'Patterns/Transactions/Stake and Delegate',
  component: StakeStory,
  args: { state: 'Stake amount' },
  argTypes: { state: { control: 'select', options: states } },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Exploratory fixed-point reference for the original stake, delayed unstake, single-role delegation, recovery, and outcome dialog compositions. It reuses canonical transaction and dialog primitives with local fixtures only.',
      },
    },
  },
} satisfies Meta<typeof StakeStory>

export default meta
type Story = StoryObj<typeof meta>

export const StakeAmount: Story = {}
export const ApprovalProgress: Story = { args: { state: 'Approval signing' } }
export const UnstakingInitiated: Story = {
  args: { state: 'Unstaking initiated' },
}
export const DelegationFailure: Story = { args: { state: 'Delegate failed' } }

function StakeStory({ state = 'Stake amount' }: { state: StakeReviewState }) {
  return <StakeState key={state} initialState={state} />
}

function StakeState({ initialState }: { initialState: StakeReviewState }) {
  return <StakeProductContext state={initialState} setState={() => {}} />
}
