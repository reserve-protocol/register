import type { Meta, StoryObj } from '@storybook/react'
import CopyValue from './copy-value'
import { withBaseProviders } from '../../../.storybook/decorators/providers'

const meta: Meta<typeof CopyValue> = {
  title: 'UI/CopyValue',
  component: CopyValue,

  decorators: [withBaseProviders],
}

export default meta
type Story = StoryObj<typeof CopyValue>

export const Default: Story = {
  args: {
    value: '0x1234567890abcdef1234567890abcdef12345678',
    text: 'Copy address',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <span className="text-sm font-mono">0x1234...5678</span>
      <CopyValue value="0x1234567890abcdef1234567890abcdef12345678" />
    </div>
  ),
}

export const CustomColor: Story = {
  args: {
    value: '0x1234567890abcdef1234567890abcdef12345678',
    color: 'hsl(var(--primary))',
  },
}

export const SideTop: Story = {
  args: {
    value: '0x1234567890abcdef1234567890abcdef12345678',
    text: 'Copy address',
    side: 'top',
  },
}

export const SideRight: Story = {
  args: {
    value: '0x1234567890abcdef1234567890abcdef12345678',
    text: 'Copy address',
    side: 'right',
  },
}
