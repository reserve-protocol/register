import type { Meta, StoryObj } from '@storybook/react-vite'
import { TransactionDocs } from './transaction-docs'
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
  title: 'Patterns/Transactions (In progress)/Stake and delegate',
  tags: ['in-progress'],
  component: StakeStory,
  args: { state: 'Stake amount' },
  argTypes: { state: { control: 'select', options: states } },
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => <TransactionDocs interactive={StakeAmount} />,
      description: {
        component: 'Staking, unstaking and delegation states.',
      },
    },
  },
} satisfies Meta<typeof StakeStory>

export default meta
type Story = StoryObj<typeof meta>

export const StakeAmount: Story = { name: 'Stake amount' }
export const ApprovalProgress: Story = {
  name: 'Approval progress',
  args: { state: 'Approval signing' },
}
export const UnstakingInitiated: Story = {
  name: 'Unstaking initiated',
  args: { state: 'Unstaking initiated' },
}
export const DelegationFailure: Story = {
  name: 'Delegation failure',
  args: { state: 'Delegate failed' },
}

function StakeStory({ state = 'Stake amount' }: { state: StakeReviewState }) {
  return <StakeState key={state} initialState={state} />
}

function StakeState({ initialState }: { initialState: StakeReviewState }) {
  return <StakeProductContext state={initialState} setState={() => {}} />
}
