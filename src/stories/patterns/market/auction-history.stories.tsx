import type { Meta, StoryObj } from '@storybook/react-vite'
import { HistoricalRebalancesTable } from './reference/auctions-browse/history-table'
import {
  historicalRebalances,
  type HistoryState,
} from './reference/auctions-browse/history-model'
import { browseRecords } from './reference/auctions-browse/model'
import { RebalanceListRecord } from './reference/auctions-browse/record'
import type {
  AuctionPhase,
  PreviewState,
} from './reference/auctions-browse/fixtures'

type Args = {
  layout: 'table' | 'browse'
  state: HistoryState | PreviewState
  phase: AuctionPhase
}
function AuctionHistory({ layout, state, phase }: Args) {
  if (layout === 'browse') {
    const browseState = state === 'expired' ? 'default' : state
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {browseRecords(browseState as PreviewState, phase, false, 1).map(
          (record) => (
            <RebalanceListRecord
              key={record.identity.id}
              record={record}
              loading={browseState === 'loading'}
            />
          )
        )}
      </div>
    )
  }
  const historyState =
    state === 'historical' || state === 'price-unavailable' ? 'default' : state
  return (
    <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border">
      <HistoricalRebalancesTable
        rows={historicalRebalances(historyState as HistoryState)}
        loading={historyState === 'loading'}
      />
    </div>
  )
}
const meta = {
  title: 'Patterns/Market/Auctions/History',
  component: AuctionHistory,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Past rebalances and auction records.',
      },
    },
  },
  args: { layout: 'table', state: 'default', phase: 'restricted' },
  argTypes: {
    layout: { control: 'inline-radio', options: ['table', 'browse'] },
    state: {
      control: 'select',
      options: [
        'default',
        'expired',
        'pressure',
        'metrics-loading',
        'zero',
        'loading',
        'empty',
        'historical',
        'unavailable',
        'price-unavailable',
      ],
    },
    phase: {
      control: 'inline-radio',
      options: ['restricted', 'permissionless', 'ongoing'],
    },
  },
} satisfies Meta<typeof AuctionHistory>
export default meta
type Story = StoryObj<typeof meta>
export const CompletedAndExpired: Story = {}
export const Pressure: Story = { args: { state: 'pressure' } }
export const MetricsLoading: Story = { args: { state: 'metrics-loading' } }
export const ZeroActivity: Story = { args: { state: 'zero' } }
export const BrowseRestricted: Story = {
  args: { layout: 'browse', state: 'default', phase: 'restricted' },
}
export const BrowsePermissionless: Story = {
  args: { layout: 'browse', state: 'default', phase: 'permissionless' },
}
export const BrowseOngoing: Story = {
  args: { layout: 'browse', state: 'default', phase: 'ongoing' },
}
export const Empty: Story = { args: { state: 'empty' } }
