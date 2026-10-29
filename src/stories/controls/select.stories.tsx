import { PlaygroundDocs } from '../shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'

const meta = {
  title: 'Components/Fields and selection/Select',
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/design-system-v1/select` · One value from a bounded list: 44px default and 32px compact. The popup sits 8px from its trigger with 40px options and a persistent selected check. Width and labelling belong to the composition: a form field uses an external label, a self-describing filter a stable accessible name.',
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

export const Playground: Story = {
  tags: ['!dev'],
}

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
        <SelectItem
          value="usdc"
          leadingVisual={<img src="/svgs/usdc.svg" alt="" className="size-5" />}
        >
          USD Coin
        </SelectItem>
        <SelectItem
          value="weth"
          leadingVisual={<img src="/svgs/weth.svg" alt="" className="size-5" />}
        >
          Wrapped Ether
        </SelectItem>
      </SelectContent>
    </Select>
  ),
}
export const LongLabel: Story = {
  name: 'Long label',
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
