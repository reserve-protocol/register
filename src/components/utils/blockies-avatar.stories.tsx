import type { Meta, StoryObj } from '@storybook/react'
import BlockiesAvatar from './blockies-avatar'

const meta: Meta<typeof BlockiesAvatar> = {
  title: 'Components/BlockiesAvatar',
  component: BlockiesAvatar,
}

export default meta
type Story = StoryObj<typeof BlockiesAvatar>

export const Default: Story = {
  args: {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <BlockiesAvatar address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" size={16} />
        <span className="text-xs text-muted-foreground">16px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <BlockiesAvatar address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" size={24} />
        <span className="text-xs text-muted-foreground">24px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <BlockiesAvatar address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" size={32} />
        <span className="text-xs text-muted-foreground">32px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <BlockiesAvatar address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" size={48} />
        <span className="text-xs text-muted-foreground">48px</span>
      </div>
    </div>
  ),
}

export const DifferentAddresses: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <BlockiesAvatar address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" size={32} />
      <BlockiesAvatar address="0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B" size={32} />
      <BlockiesAvatar address="0x1234567890abcdef1234567890abcdef12345678" size={32} />
      <BlockiesAvatar address="0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" size={32} />
      <BlockiesAvatar address="0x0000000000000000000000000000000000000001" size={32} />
    </div>
  ),
}
