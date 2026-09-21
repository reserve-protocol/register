import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ChainBadgedLogo,
  ChainLogoStack,
  EntityIdentity,
  TokenLogoStack,
} from '@/components/entity-identity'
import BlockiesAvatar from '@/components/utils/blockies-avatar'
import { Skeleton } from '@/components/design-system-v1/loading'

const tokens = [
  { symbol: 'WBTC', logo: '/svgs/wbtc.svg' },
  { symbol: 'WETH', logo: '/svgs/weth.svg' },
  { symbol: 'USDC', logo: '/svgs/usdc.svg' },
]
const meta = {
  title: 'Components/Entity identity',
  component: EntityIdentity,
  args: {
    mark: (
      <ChainBadgedLogo
        src="/imgs/socials/cmc20.png"
        chain={56}
        size="xl"
        alt="CMC20"
      />
    ),
    name: 'CoinMarketCap 20 Index DTF',
    supporting: '$CMC20 · BNB Chain',
    density: 'default',
    wrapName: false,
  },
  argTypes: {
    mark: { control: false },
    density: { control: 'inline-radio', options: ['compact', 'default'] },
    wrapName: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: '`@/components/entity-identity`',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EntityIdentity>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Compact: Story = { args: { density: 'compact', name: 'CMC20' } }
export const LongName: Story = {
  args: { name: 'CoinMarketCap 20 Diversified Digital Asset Index DTF' },
}
export const WrappedName: Story = {
  args: {
    name: 'CoinMarketCap 20 Diversified Digital Asset Index DTF',
    wrapName: true,
  },
}
export const MissingImage: Story = {
  args: {
    mark: (
      <ChainBadgedLogo symbol="UNLISTED" chain={56} alt="Unlisted collateral" />
    ),
    name: 'Unlisted collateral',
    supporting: '$UNLISTED · BNB Chain',
  },
}
export const Loading: Story = {
  render: () => (
    <div
      role="status"
      aria-label="Loading asset"
      className="flex w-64 items-center gap-3"
    >
      <Skeleton className="size-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  ),
}
export const TokenAndChainStacks: Story = {
  render: () => (
    <div className="space-y-6">
      <EntityIdentity
        mark={<TokenLogoStack tokens={tokens} />}
        name="3 assets"
        supporting="Current basket"
      />
      <EntityIdentity
        mark={<ChainLogoStack chains={[1, 8453, 56]} />}
        name="All chains"
      />
    </div>
  ),
}
export const Account: Story = {
  args: {
    density: 'compact',
    mark: (
      <BlockiesAvatar
        address="0x6B175474E89094C44Da98b954EedeAC495271d0F"
        size={24}
      />
    ),
    name: '0x6B17…1d0F',
    supporting: 'Voted for · 128K vlRSR',
  },
}
