import { PlaygroundDocs } from '../shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ChainBadgedLogo,
  ChainLogoStack,
  EntityIdentity,
  TokenLogoStack,
} from '@/components/entity-identity'
import BlockiesAvatar from '@/components/utils/blockies-avatar'
import { IdentityCell } from '../patterns/market/reference/table-family/cells'
import { ChainId } from '@/utils/chains'

const tokens = [
  { symbol: 'WBTC', logo: '/svgs/wbtc.svg' },
  { symbol: 'WETH', logo: '/svgs/weth.svg' },
  { symbol: 'USDC', logo: '/svgs/usdc.svg' },
]
const meta = {
  title: 'Components/Data display/Entity identity',
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
    nameLeading: 'default',
  },
  argTypes: {
    mark: { control: false },
    density: { control: 'inline-radio', options: ['compact', 'default'] },
    wrapName: { control: 'boolean' },
    nameLeading: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/entity-identity` · A mark, a name and an optional supporting line for an asset, DTF, chain or account. Long names end in an ellipsis within the available width; set `wrapName` only where the full name must stay readable. A 32px mark is the large size: use `ChainBadgedLogo` at xl or mark the logo with `data-entity-logo-size="xl"`, which sets the 12px gap; smaller marks use 8px. Table rows use `nameLeading="compact"` (16px/20px) so two-line identities fit the row. Compact density pairs a 14px name with a 24px mark.',
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
export const Playground: Story = {
  tags: ['!dev'],
}
export const Compact: Story = {
  args: {
    density: 'compact',
    name: 'CMC20',
    mark: (
      <ChainBadgedLogo
        src="/imgs/socials/cmc20.png"
        chain={56}
        size="lg"
        alt="CMC20"
      />
    ),
  },
}
export const TableLeading: Story = {
  name: 'Table name leading',
  args: { nameLeading: 'compact' },
}
export const LongName: Story = {
  name: 'Long name',
  args: { name: 'CoinMarketCap 20 Diversified Digital Asset Index DTF' },
}
export const WrappedName: Story = {
  name: 'Wrapped name',
  args: {
    name: 'CoinMarketCap 20 Diversified Digital Asset Index DTF',
    wrapName: true,
  },
}
export const MissingImage: Story = {
  name: 'Missing image',
  args: {
    mark: (
      <ChainBadgedLogo
        symbol="UNLISTED"
        chain={56}
        size="xl"
        alt="Unlisted collateral"
      />
    ),
    name: 'Unlisted collateral',
    supporting: '$UNLISTED · BNB Chain',
  },
}
export const Loading: Story = {
  render: () => (
    <div role="status" aria-label="Loading asset" className="w-64">
      <IdentityCell name="" symbol="" chain={ChainId.Mainnet} loading />
    </div>
  ),
}
export const TokenAndChainStacks: Story = {
  name: 'Token and chain stacks',
  render: () => (
    <div className="flex flex-col items-start gap-6">
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
