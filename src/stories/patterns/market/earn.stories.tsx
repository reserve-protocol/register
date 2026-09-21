import type { Meta, StoryObj } from '@storybook/react-vite'

import { DefiTable } from './reference/table-family/defi-table'
import {
  previewEarn,
  type EarnFamily,
  type EarnState,
} from './reference/table-family/earn-fixtures'
import { EarnTable } from './reference/table-family/earn-table'
import {
  previewOwned,
  type OwnedFamily,
  type OwnedState,
} from './reference/table-family/owned-fixtures'
import { OwnedTable } from './reference/table-family/owned-table'

type EarnArgs = {
  family: EarnFamily | 'defi' | `owned-${OwnedFamily}`
  state: EarnState | OwnedState
  wallet: boolean
}

const EarnReference = ({ family, state, wallet }: EarnArgs) => {
  if (family === 'defi') return <DefiTable state={state as EarnState} />
  if (family === 'owned-lock' || family === 'owned-stake') {
    const ownedFamily = family.replace('owned-', '') as OwnedFamily
    return (
      <OwnedTable
        family={ownedFamily}
        rows={previewOwned(ownedFamily, state as OwnedState)}
        loading={state === 'loading'}
        onModify={() => undefined}
      />
    )
  }
  const earnFamily = family as EarnFamily
  return (
    <EarnTable
      rows={previewEarn(earnFamily, state as EarnState)}
      state={state as EarnState}
      family={earnFamily}
      wallet={wallet}
      onOpen={() => undefined}
      onHelp={() => undefined}
    />
  )
}

const meta = {
  title: 'Patterns/Market/Earn and owned positions',
  component: EarnReference,
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-5xl bg-card">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Story-only reference preserving Index and Yield Earn tables, DeFi opportunities, vote-lock positions and staked RSR positions.',
      },
    },
  },
  args: { family: 'index', state: 'default', wallet: true },
  argTypes: {
    family: {
      control: 'select',
      options: ['index', 'yield', 'defi', 'owned-lock', 'owned-stake'],
    },
    state: {
      control: 'select',
      options: [
        'default',
        'loading',
        'wallet-loading',
        'sparse',
        'missing',
        'long',
        'pending',
        'empty',
      ],
    },
    wallet: { control: 'boolean' },
  },
} satisfies Meta<typeof EarnReference>

export default meta
type Story = StoryObj<typeof meta>

export const IndexGovernance: Story = {}
export const YieldGovernance: Story = { args: { family: 'yield' } }
export const DefiYield: Story = { args: { family: 'defi' } }
export const VoteLocks: Story = { args: { family: 'owned-lock' } }
export const StakedRsr: Story = { args: { family: 'owned-stake' } }
export const Pending: Story = {
  args: { family: 'owned-lock', state: 'pending' },
}
export const MissingData: Story = { args: { state: 'missing' } }
export const LongContent: Story = { args: { state: 'long' } }
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }
