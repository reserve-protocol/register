import type { Meta, StoryObj } from '@storybook/react-vite'

import { FocusedDocs } from '../../shared/focused-docs'
import { StorySurface } from '../../shared/story-surface'
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
  indexWallet: boolean
  yieldWallet: boolean
}

const EarnReference = ({
  family,
  state,
  indexWallet,
  yieldWallet,
}: EarnArgs) => {
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
      wallet={family === 'index' ? indexWallet : yieldWallet}
      onOpen={() => undefined}
      onHelp={() => undefined}
    />
  )
}

const meta = {
  title: 'Patterns/Market/Earn and owned positions',
  component: EarnReference,
  decorators: [
    (Story, context) => (
      <StorySurface
        className="bg-card"
        fullHeight={context.viewMode !== 'docs'}
        desktopMinWidth={context.viewMode === 'docs'}
      >
        <Story />
      </StorySurface>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => <FocusedDocs of={DocsPreview} />,
      description: {
        component:
          'Earn opportunities and staking positions. Select a family and data state above the preview; these product action targets are static layout references.',
      },
    },
  },
  args: {
    family: 'index',
    state: 'default',
    indexWallet: true,
    yieldWallet: true,
  },
  argTypes: {
    family: { control: false },
    state: { control: false },
    indexWallet: {
      name: 'wallet connected',
      control: 'boolean',
      if: { arg: 'family', eq: 'index' },
    },
    yieldWallet: {
      name: 'wallet connected',
      control: 'boolean',
      if: { arg: 'family', eq: 'yield' },
    },
  },
} satisfies Meta<typeof EarnReference>

export default meta
type Story = StoryObj<typeof meta>

export const DocsPreview: Story = {
  name: 'Docs preview',
  tags: ['!dev'],
  argTypes: {
    family: {
      control: 'select',
      options: ['index', 'yield', 'defi', 'owned-lock', 'owned-stake'],
    },
    state: {
      control: 'select',
      options: ['default', 'loading', 'missing', 'long', 'empty'],
    },
  },
}
export const IndexGovernance: Story = {
  name: 'Index governance',
}
export const YieldGovernance: Story = {
  name: 'Yield governance',
  args: { family: 'yield' },
}
export const DefiYield: Story = {
  name: 'DeFi yield',
  args: { family: 'defi' },
}
export const VoteLocks: Story = {
  name: 'Vote locks',
  args: { family: 'owned-lock' },
}
export const StakedRsr: Story = {
  name: 'Staked RSR',
  args: { family: 'owned-stake' },
}
export const Pending: Story = {
  args: { family: 'owned-lock', state: 'pending' },
}
export const WalletLoading: Story = {
  name: 'Wallet loading',
  args: { state: 'wallet-loading' },
}
export const Sparse: Story = { args: { state: 'sparse' } }
export const MissingData: Story = {
  name: 'Missing data',
  args: { state: 'missing' },
}
export const LongContent: Story = {
  name: 'Long content',
  args: { state: 'long' },
}
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }
