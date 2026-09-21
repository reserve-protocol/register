import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { ManualIssuanceAnchor } from './reference/transaction-composition-manual-anchor'
import {
  MANUAL_STATE_GROUPS,
  type ManualReviewState,
} from './reference/transaction-composition-manual-scenarios'

const states = MANUAL_STATE_GROUPS.flatMap((group) => group.states)

const meta = {
  title: 'Patterns/Transactions/Manual Issuance',
  component: ManualIssuanceStory,
  args: { state: 'Mint requirements' },
  argTypes: { state: { control: 'select', options: states } },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Manual mint and redeem states.',
      },
    },
  },
} satisfies Meta<typeof ManualIssuanceStory>

export default meta
type Story = StoryObj<typeof meta>

export const MintRequirements: Story = {}
export const ApprovalRecovery: Story = {
  args: { state: 'Partial approval failure' },
}
export const RedeemPreview: Story = { args: { state: 'Redeem preview' } }
export const MintOutcome: Story = { args: { state: 'Mint outcome' } }

function ManualIssuanceStory({
  state = 'Mint requirements',
}: {
  state: ManualReviewState
}) {
  return <ManualState key={state} initialState={state} />
}

function ManualState({ initialState }: { initialState: ManualReviewState }) {
  const [remembered, remember] = useState({ amount: '100', unlimited: true })
  return (
    <ManualIssuanceAnchor
      amount={remembered.amount}
      remember={(amount, unlimited) => remember({ amount, unlimited })}
      state={initialState}
      unlimited={remembered.unlimited}
    />
  )
}
