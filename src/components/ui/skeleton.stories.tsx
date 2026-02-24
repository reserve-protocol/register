import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,

}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  args: { className: 'h-4 w-48' },
}

export const Circle: Story = {
  args: { className: 'h-12 w-12 rounded-full' },
}

export const Card: Story = {
  render: () => (
    <div className="flex flex-col space-y-3 w-64">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  ),
}

export const TableRows: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  ),
}
