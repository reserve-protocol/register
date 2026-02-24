import type { Meta, StoryObj } from '@storybook/react'
import ChainLogo from './ChainLogo'
import StackedChainLogo from './StackedChainLogo'

const meta: Meta<typeof ChainLogo> = {
  title: 'Components/ChainLogo',
  component: ChainLogo,
}

export default meta
type Story = StoryObj<typeof ChainLogo>

export const AllChains: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <ChainLogo chain={1} width={24} height={24} />
        <span className="text-xs text-muted-foreground">Ethereum</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ChainLogo chain={8453} width={24} height={24} />
        <span className="text-xs text-muted-foreground">Base</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ChainLogo chain={42161} width={24} height={24} />
        <span className="text-xs text-muted-foreground">Arbitrum</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ChainLogo chain={56} width={24} height={24} />
        <span className="text-xs text-muted-foreground">BSC</span>
      </div>
    </div>
  ),
}

export const ByName: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <ChainLogo chain="Ethereum" width={24} height={24} />
      <ChainLogo chain="Base" width={24} height={24} />
      <ChainLogo chain="Arbitrum" width={24} height={24} />
    </div>
  ),
}

export const Stacked: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <StackedChainLogo chains={[1, 8453]} />
        <span className="text-sm text-muted-foreground">Ethereum + Base</span>
      </div>
      <div className="flex items-center gap-4">
        <StackedChainLogo chains={[1, 8453, 42161]} />
        <span className="text-sm text-muted-foreground">Three chains</span>
      </div>
    </div>
  ),
}
