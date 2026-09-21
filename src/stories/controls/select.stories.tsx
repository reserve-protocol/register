import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'

const meta = {
  title: 'Components/Select',
  parameters: {
    docs: {
      description: {
        component: '`@/components/design-system-v1/select`',
      },
    },
  },
  component: SelectTrigger,
  args: {
    'aria-label': 'Created',
    disabled: false,
    size: 'default',
  },
  argTypes: {
    children: { control: false },
    className: { control: false },
    size: { control: 'inline-radio', options: ['compact', 'default'] },
  },
  render: (args) => (
    <Select defaultValue="all">
      <SelectTrigger {...args} className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All time</SelectItem>
        <SelectItem value="24h">Last 24 hours</SelectItem>
        <SelectItem value="legacy" disabled>
          Legacy range
        </SelectItem>
      </SelectContent>
    </Select>
  ),
} satisfies Meta<typeof SelectTrigger>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Placeholder: Story = {
  render: (args) => (
    <Select>
      <SelectTrigger {...args} className="w-56">
        <SelectValue placeholder="Choose network" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ethereum">Ethereum</SelectItem>
        <SelectItem value="base">Base</SelectItem>
        <SelectItem value="bsc">BNB Smart Chain</SelectItem>
      </SelectContent>
    </Select>
  ),
}
export const Identity: Story = {
  render: (args) => (
    <Select defaultValue="usdc">
      <SelectTrigger {...args} aria-label="Asset" className="w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="usdc">
          <span className="flex items-center gap-2">
            <img src="/svgs/usdc.svg" alt="" className="size-5" />
            USD Coin
          </span>
        </SelectItem>
        <SelectItem value="weth">
          <span className="flex items-center gap-2">
            <img src="/svgs/weth.svg" alt="" className="size-5" />
            Wrapped Ether
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  ),
}
export const LongLabel: Story = {
  render: (args) => (
    <Select defaultValue="long">
      <SelectTrigger {...args} aria-label="Asset" className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="long">
          CoinMarketCap 20 Diversified Digital Asset Index DTF
        </SelectItem>
        <SelectItem value="other">Large Cap Index</SelectItem>
      </SelectContent>
    </Select>
  ),
}
