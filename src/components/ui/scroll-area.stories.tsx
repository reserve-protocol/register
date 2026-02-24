import type { Meta, StoryObj } from '@storybook/react'
import { ScrollArea, ScrollBar } from './scroll-area'
import { Separator } from './separator'

const meta: Meta<typeof ScrollArea> = {
  title: 'UI/ScrollArea',
  component: ScrollArea,

}

export default meta
type Story = StoryObj<typeof ScrollArea>

const tokens = [
  'USDC', 'USDT', 'DAI', 'FRAX', 'LUSD', 'sDAI', 'cUSDCv3',
  'aUSDC', 'fUSDC', 'RSR', 'WETH', 'WBTC', 'stETH', 'rETH',
  'cbETH', 'COMP', 'AAVE', 'CRV', 'CVX', 'MKR',
]

export const VerticalScroll: Story = {
  render: () => (
    <ScrollArea className="h-48 w-48 rounded-md border p-4">
      {tokens.map((token, i) => (
        <div key={token}>
          <div className="text-sm py-1">{token}</div>
          {i < tokens.length - 1 && <Separator />}
        </div>
      ))}
    </ScrollArea>
  ),
}

export const HorizontalScroll: Story = {
  render: () => (
    <ScrollArea className="w-64 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {tokens.map((token) => (
          <div
            key={token}
            className="shrink-0 rounded-md border px-3 py-1 text-sm"
          >
            {token}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}
