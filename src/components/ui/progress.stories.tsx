import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from './progress'

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,

}

export default meta
type Story = StoryObj<typeof Progress>

export const Empty: Story = {
  args: { value: 0, className: 'w-64' },
}

export const Half: Story = {
  args: { value: 50, className: 'w-64' },
}

export const Full: Story = {
  args: { value: 100, className: 'w-64' },
}

export const CustomIndicator: Story = {
  args: {
    value: 75,
    className: 'w-64',
    indicatorClassName: 'bg-success',
  },
}
