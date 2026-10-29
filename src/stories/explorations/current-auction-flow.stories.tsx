import type { Meta, StoryObj } from '@storybook/react-vite'

import { FocusedDocs } from '../shared/focused-docs'
import { StorySurface } from '../shared/story-surface'
import { CurrentAuction } from '../patterns/market/reference/auctions-current/auction-panel'
import { CurrentSceneFeedback } from '../patterns/market/reference/auctions-current/scene-feedback'
import {
  SOURCE_RECORDS,
  type DataState,
  type Outcome,
  type Scenario,
  type Viewer,
} from '../patterns/market/reference/auctions-current/fixtures'
import {
  initialWorkspace,
  type Operation,
} from '../patterns/market/reference/auctions-current/model'

type Args = {
  scenario: Scenario
  data: DataState
  viewer: Viewer
  network: boolean
  outcome: Outcome
  editor: boolean
}

const operationFor = (outcome: Outcome): Operation =>
  outcome === 'reject'
    ? 'rejected'
    : outcome === 'revert'
      ? 'failed'
      : outcome === 'indexing'
        ? 'indexing'
        : 'idle'

function CurrentAuctionFlow({
  scenario,
  data,
  viewer,
  network,
  outcome,
  editor,
}: Args) {
  if (
    scenario === 'loading' ||
    scenario === 'not-found' ||
    scenario === 'empty'
  ) {
    return (
      <StorySurface>
        <div className="w-full bg-card p-6">
          <CurrentSceneFeedback
            scenario={scenario}
            empty={scenario === 'empty'}
          />
        </div>
      </StorySurface>
    )
  }

  const record =
    scenario === 'hybrid' ? SOURCE_RECORDS.lcap : SOURCE_RECORDS.cmc20
  const state = {
    ...initialWorkspace(record, scenario),
    editing: editor,
    operation: operationFor(outcome),
  }

  return (
    <StorySurface>
      <div className="w-full bg-card p-6 [container-type:inline-size]">
        <CurrentAuction
          record={record}
          scenario={scenario}
          data={data}
          viewer={viewer}
          network={network}
          outcome={outcome}
          state={state}
          dispatch={() => {}}
          onConnect={() => {}}
          onNetwork={() => {}}
          onRetry={() => {}}
          onDone={() => {}}
        />
      </div>
    </StorySurface>
  )
}

const meta = {
  title: 'Explorations/Auctions/Auction detail workspace',
  id: 'explorations-auctions-current-auction-flow',
  tags: ['in-progress'],
  component: CurrentAuctionFlow,
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => <FocusedDocs of={Ready} />,
      description: {
        component:
          'In progress · Alternative auction detail workspace for ready, live, completed and recovery states. Chart, liquidity, and weight values are illustrative. Actions in this preview are static; use the controls to inspect their states.',
      },
    },
  },
  args: {
    scenario: 'ready',
    data: 'ready',
    viewer: 'launcher',
    network: true,
    outcome: 'success',
    editor: false,
  },
  argTypes: {
    scenario: {
      control: 'select',
      options: [
        'ready',
        'permissionless',
        'hybrid',
        'live',
        'no-bids',
        'repeat',
        'remove',
        'progressing',
        'liquidity',
        'liquidity-closed',
        'complete',
        'expired',
        'expired-complete',
        'filler',
        'multiple',
        'empty',
        'loading',
        'not-found',
      ],
    },
    data: {
      control: 'select',
      options: [
        'ready',
        'pending',
        'price-error',
        'auction-error',
        'metadata-error',
        'bounds',
        'error',
      ],
    },
    viewer: {
      control: 'inline-radio',
      options: ['visitor', 'member', 'launcher'],
    },
    network: { control: 'boolean' },
    outcome: {
      control: 'inline-radio',
      options: ['success', 'reject', 'revert', 'indexing'],
    },
    editor: { control: 'boolean' },
  },
} satisfies Meta<typeof CurrentAuctionFlow>

export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {}
export const LiveWithBids: Story = {
  name: 'Live with bids',
  args: { scenario: 'live' },
}
export const LiveWithoutBids: Story = {
  name: 'Live without bids',
  args: { scenario: 'no-bids' },
}
export const HybridBasket: Story = {
  name: 'Hybrid basket',
  args: { scenario: 'hybrid' },
}
export const TargetWeightEditor: Story = {
  name: 'Target weight editor',
  args: { scenario: 'hybrid', editor: true },
}
export const TokenRemoval: Story = {
  name: 'Token removal',
  args: { scenario: 'remove' },
}
export const ProgressiveRebalance: Story = {
  name: 'Progressive rebalance',
  args: { scenario: 'progressing' },
}
export const LiquidityWarning: Story = {
  name: 'Liquidity warning',
  args: { scenario: 'liquidity' },
}
export const ClosedMarketLiquidity: Story = {
  name: 'Closed market liquidity',
  args: { scenario: 'liquidity-closed' },
}
export const ExpiredIncomplete: Story = {
  name: 'Expired incomplete',
  args: { scenario: 'expired' },
}
export const ExpiredComplete: Story = {
  name: 'Expired complete',
  args: { scenario: 'expired-complete' },
}
export const BrowserFiller: Story = {
  name: 'Browser auction filler',
  args: { scenario: 'filler' },
}
export const PriceUnavailable: Story = {
  name: 'Price unavailable',
  args: { data: 'price-error' },
}
export const AuctionUnavailable: Story = {
  name: 'Auction unavailable',
  args: { data: 'auction-error' },
}
export const MetadataUnavailable: Story = {
  name: 'Metadata unavailable',
  args: { data: 'metadata-error' },
}
export const OutOfBounds: Story = {
  name: 'Out of bounds',
  args: { data: 'bounds' },
}
export const WalletRejected: Story = {
  name: 'Wallet rejected',
  args: { outcome: 'reject' },
}
export const TransactionReverted: Story = {
  name: 'Transaction reverted',
  args: { outcome: 'revert' },
}
export const IndexingDelayed: Story = {
  name: 'Indexing delayed',
  args: { outcome: 'indexing' },
}
export const Visitor: Story = { args: { viewer: 'visitor' } }
export const WrongNetwork: Story = {
  name: 'Wrong network',
  args: { network: false },
}
export const Loading: Story = { args: { scenario: 'loading' } }
export const Empty: Story = { args: { scenario: 'empty' } }
export const NotFound: Story = {
  name: 'Not found',
  args: { scenario: 'not-found' },
}
