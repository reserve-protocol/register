import type { Meta, StoryObj } from '@storybook/react'
import Spinner from './spinner'

const meta: Meta<typeof Spinner> = {
  title: 'UI/Spinner',
  component: Spinner,

}

export default meta
type Story = StoryObj<typeof Spinner>

export const Default: Story = {}

export const Small: Story = {
  args: { size: 12 },
}

export const Large: Story = {
  args: { size: 32 },
}

export const CustomStroke: Story = {
  args: { size: 24, strokeWidth: 2 },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size={12} />
      <Spinner size={16} />
      <Spinner size={24} />
      <Spinner size={32} />
      <Spinner size={48} />
    </div>
  ),
}
