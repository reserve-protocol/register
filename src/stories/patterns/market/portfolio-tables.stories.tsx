import type { Meta, StoryObj } from '@storybook/react-vite'

import { Positions } from './reference/table-family/positions'
import {
  POSITIONS,
  WITHDRAWALS,
  YIELD_POSITIONS,
  withLongContent,
} from './reference/table-family/fixtures'
import {
  Withdrawals,
  type WithdrawalPreview,
} from './reference/table-family/withdrawals'

type PortfolioArgs = {
  family: 'index' | 'yield'
  state: 'default' | 'loading' | 'long' | 'empty'
  withdrawalState: WithdrawalPreview
}

const PortfolioReference = ({
  family,
  state,
  withdrawalState,
}: PortfolioArgs) => {
  const source = family === 'index' ? POSITIONS : YIELD_POSITIONS
  const rows =
    state === 'empty' ? [] : state === 'long' ? withLongContent(source) : source
  const withdrawalRows = state === 'empty' ? [] : WITHDRAWALS
  const states = Object.fromEntries(
    withdrawalRows.map((row) => [row.id, withdrawalState])
  )

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden bg-secondary">
      <Positions rows={rows} family={family} loading={state === 'loading'} />
      <Withdrawals
        rows={withdrawalRows}
        loading={state === 'loading'}
        states={states}
        onWithdraw={() => undefined}
        onSource={() => undefined}
      />
    </div>
  )
}

const meta = {
  title: 'Patterns/Market/Portfolio tables',
  component: PortfolioReference,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Story-only reference preserving the original Portfolio position and pending-withdrawal tables. Reusable cells come from canonical component modules.',
      },
    },
  },
  args: {
    family: 'index',
    state: 'default',
    withdrawalState: 'idle',
  },
  argTypes: {
    family: { control: 'inline-radio', options: ['index', 'yield'] },
    state: {
      control: 'inline-radio',
      options: ['default', 'loading', 'long', 'empty'],
    },
    withdrawalState: {
      control: 'inline-radio',
      options: ['idle', 'processing', 'withdrawn'],
    },
  },
} satisfies Meta<typeof PortfolioReference>

export default meta
type Story = StoryObj<typeof meta>

export const IndexPositions: Story = {}
export const YieldPositions: Story = { args: { family: 'yield' } }
export const LongContent: Story = { args: { state: 'long' } }
export const Loading: Story = { args: { state: 'loading' } }
export const WithdrawalProcessing: Story = {
  args: { withdrawalState: 'processing' },
}
export const WithdrawalComplete: Story = {
  args: { withdrawalState: 'withdrawn' },
}
export const Empty: Story = { args: { state: 'empty' } }
