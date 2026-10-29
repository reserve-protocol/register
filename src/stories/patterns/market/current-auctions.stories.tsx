import type { Meta, StoryObj } from '@storybook/react-vite'

import { StorySurface } from '../../shared/story-surface'
import { CurrentRebalancesTable } from './reference/auctions-current-table/table'
import {
  currentTableRows,
  type TableScenario,
} from './reference/auctions-current-table/model'
import type { DataState, Viewer } from './reference/auctions-current/fixtures'

type Args = {
  tableScenario: TableScenario
  data: DataState
  viewer: Viewer
  network: boolean
}

function MarketCurrentAuctions(args: Args) {
  return (
    <div className="w-full bg-card">
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
  title: 'Patterns/Market/Auctions/Active and upcoming auctions',
  id: 'patterns-market-auctions-current',
  component: MarketCurrentAuctions,
  decorators: [
    (Story, context) => (
      <StorySurface
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
      description: {
        component:
          'Auctions ready to start or already live, with their supported states.',
      },
    },
  },
  args: {
    tableScenario: 'all',
    data: 'ready',
    viewer: 'launcher',
    network: true,
  },
  argTypes: {
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
  },
} satisfies Meta<typeof MarketCurrentAuctions>
export default meta
type Story = StoryObj<typeof meta>

export const AllTableStates: Story = {
  name: 'All table states',
}
export const Restricted: Story = {
  args: { tableScenario: 'ready', viewer: 'member' },
}
export const Permissionless: Story = {
  args: { tableScenario: 'permissionless', viewer: 'member' },
}
