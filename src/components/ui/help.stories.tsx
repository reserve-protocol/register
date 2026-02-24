import type { Meta, StoryObj } from '@storybook/react'
import Help from './help'

const meta: Meta<typeof Help> = {
  title: 'UI/Help',
  component: Help,

}

export default meta
type Story = StoryObj<typeof Help>

export const Default: Story = {
  args: {
    content: 'This is a help tooltip explaining a concept.',
  },
}

export const Large: Story = {
  args: {
    content: 'Larger help icon for headers.',
    size: 16,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <span className="text-sm">Backing buffer</span>
      <Help content="Percentage of extra collateral to keep before forwarding to revenue traders." />
    </div>
  ),
}

export const SideRight: Story = {
  args: {
    content: 'Tooltip appears on the right.',
    side: 'right',
  },
}

export const SideBottom: Story = {
  args: {
    content: 'Tooltip appears on the bottom.',
    side: 'bottom',
  },
}

export const SideLeft: Story = {
  args: {
    content: 'Tooltip appears on the left.',
    side: 'left',
  },
}
