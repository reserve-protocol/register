import type { Meta, StoryObj } from '@storybook/react-vite'
import { CurrentRebalancesTable } from './reference/auctions-current-table/table'
import {
  currentTableRows,
  type TableScenario,
} from './reference/auctions-current-table/model'
import { CurrentAuction } from './reference/auctions-current/auction-panel'
import { CurrentSceneFeedback } from './reference/auctions-current/scene-feedback'
import {
  SOURCE_RECORDS,
  type DataState,
  type Outcome,
  type Scenario,
  type Viewer,
} from './reference/auctions-current/fixtures'
import {
  initialWorkspace,
  type Operation,
} from './reference/auctions-current/model'

type Args = {
  view: 'table' | 'detail'
  tableScenario: TableScenario
  detailScenario: Scenario
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

function CurrentAuctionDetail({
  detailScenario,
  data,
  viewer,
  network,
  outcome,
  editor,
}: Omit<Args, 'view' | 'tableScenario'>) {
  if (
    detailScenario === 'loading' ||
    detailScenario === 'not-found' ||
    detailScenario === 'empty'
  ) {
    return (
      <div className="mx-auto max-w-5xl rounded-xl border bg-card p-6">
        <CurrentSceneFeedback
          scenario={detailScenario}
          empty={detailScenario === 'empty'}
        />
      </div>
    )
  }
  const record =
    detailScenario === 'hybrid' ? SOURCE_RECORDS.lcap : SOURCE_RECORDS.cmc20
  const state = {
    ...initialWorkspace(record, detailScenario),
    editing: editor,
    operation: operationFor(outcome),
  }
  return (
    <div className="mx-auto max-w-5xl rounded-xl border bg-card p-6 [container-type:inline-size]">
      <CurrentAuction
        record={record}
        scenario={detailScenario}
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
  )
}

function MarketCurrentAuctions(args: Args) {
  if (args.view === 'detail') return <CurrentAuctionDetail {...args} />
  return (
    <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border bg-card">
      <CurrentRebalancesTable
        rows={currentTableRows(
          args.tableScenario,
          args.viewer,
          args.data,
          args.network
        )}
        hrefFor={(row) => `/auctions/${row.previewId}`}
      />
    </div>
  )
}

const meta = {
  title: 'Patterns/Market/Auctions/Current',
  component: MarketCurrentAuctions,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Rebalance auctions, bids and weight editing.',
      },
    },
  },
  args: {
    view: 'table',
    tableScenario: 'all',
    detailScenario: 'ready',
    data: 'ready',
    viewer: 'launcher',
    network: true,
    outcome: 'success',
    editor: false,
  },
  argTypes: {
    view: { control: 'inline-radio', options: ['table', 'detail'] },
    tableScenario: {
      control: 'select',
      options: [
        'all',
        'ready',
        'permissionless',
        'hybrid',
        'live',
        'no-bids',
        'repeat',
        'indexing',
        'complete',
        'multiple',
        'empty',
        'loading',
      ],
    },
    detailScenario: {
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
} satisfies Meta<typeof MarketCurrentAuctions>
export default meta
type Story = StoryObj<typeof meta>

export const AllTableStates: Story = {}
export const Restricted: Story = {
  args: { tableScenario: 'ready', viewer: 'member' },
}
export const Permissionless: Story = {
  args: { tableScenario: 'permissionless', viewer: 'member' },
}
export const LiveWithBids: Story = {
  args: { view: 'detail', detailScenario: 'live' },
}
export const LiveWithoutBids: Story = {
  args: { view: 'detail', detailScenario: 'no-bids' },
}
export const HybridBasket: Story = {
  args: { view: 'detail', detailScenario: 'hybrid' },
}
export const TargetWeightEditor: Story = {
  args: { view: 'detail', detailScenario: 'hybrid', editor: true },
}
export const TokenRemoval: Story = {
  args: { view: 'detail', detailScenario: 'remove' },
}
export const ProgressiveRebalance: Story = {
  args: { view: 'detail', detailScenario: 'progressing' },
}
export const LiquidityWarning: Story = {
  args: { view: 'detail', detailScenario: 'liquidity' },
}
export const ClosedMarketLiquidity: Story = {
  args: { view: 'detail', detailScenario: 'liquidity-closed' },
}
export const ExpiredIncomplete: Story = {
  args: { view: 'detail', detailScenario: 'expired' },
}
export const ExpiredComplete: Story = {
  args: { view: 'detail', detailScenario: 'expired-complete' },
}
export const BrowserFiller: Story = {
  args: { view: 'detail', detailScenario: 'filler' },
}
export const PriceUnavailable: Story = {
  args: { view: 'detail', data: 'price-error' },
}
export const AuctionUnavailable: Story = {
  args: { view: 'detail', data: 'auction-error' },
}
export const MetadataUnavailable: Story = {
  args: { view: 'detail', data: 'metadata-error' },
}
export const OutOfBounds: Story = { args: { view: 'detail', data: 'bounds' } }
export const WalletRejected: Story = {
  args: { view: 'detail', outcome: 'reject' },
}
export const TransactionReverted: Story = {
  args: { view: 'detail', outcome: 'revert' },
}
export const IndexingDelayed: Story = {
  args: { view: 'detail', outcome: 'indexing' },
}
export const Visitor: Story = { args: { view: 'detail', viewer: 'visitor' } }
export const WrongNetwork: Story = { args: { view: 'detail', network: false } }
export const Loading: Story = {
  args: { view: 'detail', detailScenario: 'loading' },
}
export const Empty: Story = {
  args: { view: 'detail', detailScenario: 'empty' },
}
export const NotFound: Story = {
  args: { view: 'detail', detailScenario: 'not-found' },
}
