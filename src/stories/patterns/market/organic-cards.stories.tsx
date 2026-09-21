import type { Meta, StoryObj } from '@storybook/react-vite'
import type { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { DiscoverIndexDTFCard } from '@/views/home/components/discover-index-dtf/discover-index-dtf-card'
import { IndexDTFFeatureCard } from '@/views/home/components/highlighted-dtfs/feature-card'
import { toHighlightedDtf } from '@/views/home/components/highlighted-dtfs/utils'
import type { FeaturedDTFItem } from '@/views/home/hooks/use-featured-dtfs'
import featuredSnapshot from '../../../../e2e/snapshots/shared/featured-dtfs.json'
import { DISCOVER } from './reference/table-family/discover-fixtures'
import buildoutIcon from './reference/cards/buildout.svg'

type Args = { placement: 'home' | 'discover' }
const source = featuredSnapshot.data.items
  .buildout?.[0] as unknown as FeaturedDTFItem
const homeCard = toHighlightedDtf({
  key: 'buildout',
  versions: [
    {
      ...source,
      brand: { ...source.brand, icon: buildoutIcon, video: undefined },
    },
  ],
})!
const row = DISCOVER[0]
const discoverCard = {
  address: row.address,
  symbol: row.symbol,
  name: row.name,
  chainId: row.chainId,
  status: row.status,
  price: row.price ?? 0,
  fee: 0.01,
  marketCap: row.marketCap ?? 0,
  basket: row.basket,
  performance: row.series,
  performancePercent: row.change ?? 0,
  brand: { icon: '/imgs/socials/cmc20.png' },
  priceChange: { period: '1m', percent: row.change ?? 0 },
} as unknown as IndexDTFItem
function OrganicMarketCard({ placement }: Args) {
  return (
    <div className="mx-auto max-w-md">
      {placement === 'home' ? (
        <IndexDTFFeatureCard dtf={homeCard} />
      ) : (
        <DiscoverIndexDTFCard dtf={discoverCard} />
      )}
    </div>
  )
}
const meta = {
  title: 'Patterns/Market/Cards/Organic Content',
  component: OrganicMarketCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Canonical Home featured-card and Discover compact-card compositions with captured local data and local brand assets.',
      },
    },
  },
  args: { placement: 'home' },
  argTypes: {
    placement: { control: 'inline-radio', options: ['home', 'discover'] },
  },
} satisfies Meta<typeof OrganicMarketCard>
export default meta
type Story = StoryObj<typeof meta>
export const HomeFeatured: Story = {}
export const DiscoverCompact: Story = { args: { placement: 'discover' } }
