import type { Meta, StoryObj } from '@storybook/react-vite'

import { FocusedDocs } from '../../shared/focused-docs'
import { StorySurface } from '../../shared/story-surface'
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
  tableState: HistoryState
  browseState: PreviewState
  phase: AuctionPhase
}
function AuctionHistory({ layout, tableState, browseState, phase }: Args) {
  if (layout === 'browse') {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {browseRecords(browseState, phase, false, 1).map((record) => (
          <RebalanceListRecord
            key={record.identity.id}
            record={record}
            loading={browseState === 'loading'}
          />
        ))}
      </div>
    )
  }
  return (
    <HistoricalRebalancesTable
      rows={historicalRebalances(tableState)}
      loading={tableState === 'loading'}
    />
  )
}
const meta = {
  title: 'Patterns/Market/Auctions/Completed and expired auctions',
  id: 'patterns-market-auctions-history',
  component: AuctionHistory,
  decorators: [
    (Story, context) => (
      <StorySurface
        className={context.args.layout === 'table' ? 'bg-card' : undefined}
        fullHeight={context.viewMode !== 'docs'}
        desktopMinWidth={
          context.viewMode === 'docs' && context.args.layout === 'table'
        }
      >
        <Story />
      </StorySurface>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => <FocusedDocs of={CompletedAndExpired} />,
      description: {
        component:
          'Completed and expired auction records, with browse variants.',
      },
    },
  },
  args: {
    layout: 'table',
    tableState: 'default',
    browseState: 'default',
    phase: 'restricted',
  },
  argTypes: {
    layout: { control: 'inline-radio', options: ['table', 'browse'] },
    tableState: {
      name: 'state',
      control: 'select',
      options: [
        'default',
        'expired',
        'pressure',
        'metrics-loading',
        'zero',
        'loading',
        'empty',
        'unavailable',
      ],
      if: { arg: 'layout', eq: 'table' },
    },
    browseState: {
      name: 'state',
      control: 'select',
      options: [
        'default',
        'pressure',
        'metrics-loading',
        'zero',
        'loading',
        'empty',
        'historical',
        'unavailable',
        'price-unavailable',
      ],
      if: { arg: 'layout', eq: 'browse' },
    },
    phase: {
      control: 'inline-radio',
      options: ['restricted', 'permissionless', 'ongoing'],
      if: { arg: 'layout', eq: 'browse' },
    },
  },
} satisfies Meta<typeof AuctionHistory>
export default meta
type Story = StoryObj<typeof meta>
export const CompletedAndExpired: Story = {
  name: 'Completed and expired',
}
export const Pressure: Story = { args: { tableState: 'pressure' } }
export const MetricsLoading: Story = {
  name: 'Metrics loading',
  args: { tableState: 'metrics-loading' },
}
export const ZeroActivity: Story = {
  name: 'Zero activity',
  args: { tableState: 'zero' },
}
export const BrowseRestricted: Story = {
  name: 'Browse restricted',
  args: { layout: 'browse', browseState: 'default', phase: 'restricted' },
}
export const BrowsePermissionless: Story = {
  name: 'Browse permissionless',
  args: { layout: 'browse', browseState: 'default', phase: 'permissionless' },
}
export const BrowseOngoing: Story = {
  name: 'Browse ongoing',
  args: { layout: 'browse', browseState: 'default', phase: 'ongoing' },
}
export const Empty: Story = { args: { tableState: 'empty' } }
