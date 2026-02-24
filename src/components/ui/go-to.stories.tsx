import type { Meta, StoryObj } from '@storybook/react'
import GoTo from './go-to'

const meta: Meta<typeof GoTo> = {
  title: 'UI/GoTo',
  component: GoTo,

}

export default meta
type Story = StoryObj<typeof GoTo>

export const Default: Story = {
  args: {
    href: 'https://etherscan.io',
  },
}

export const WithText: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <span className="text-sm">View contract</span>
      <GoTo href="https://etherscan.io" />
    </div>
  ),
}
