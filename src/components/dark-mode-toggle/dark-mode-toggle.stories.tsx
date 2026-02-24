import type { Meta, StoryObj } from '@storybook/react'
import DarkModeToggle from '.'

const meta: Meta<typeof DarkModeToggle> = {
  title: 'Components/DarkModeToggle',
  component: DarkModeToggle,
}

export default meta
type Story = StoryObj<typeof DarkModeToggle>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <DarkModeToggle className="cursor-pointer" />
      <span className="text-sm text-muted-foreground">Click to toggle</span>
    </div>
  ),
}
