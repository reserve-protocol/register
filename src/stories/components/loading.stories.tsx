import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton, Spinner } from '@/components/design-system-v1/loading'
const meta = {
  title: 'Components/Loading',
  component: Spinner,
  args: { size: 16, label: 'Loading balances' },
  argTypes: { size: { control: 'inline-radio', options: [14, 16, 24] } },
  parameters: {
    docs: {
      description: {
        component:
          'Import Spinner and Skeleton from @/components/design-system-v1/loading. Skeletons preserve unresolved content geometry; a labeled spinner announces an active operation. Both honor reduced motion.',
      },
    },
  },
} satisfies Meta<typeof Spinner>
export default meta
type Story = StoryObj<typeof meta>
export const SpinnerPlayground: Story = {}
export const Text: Story = {
  render: () => (
    <div
      role="status"
      aria-label="Loading description"
      className="w-64 space-y-2"
    >
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-2/3" />
    </div>
  ),
}
export const Record: Story = {
  render: () => (
    <div
      role="status"
      aria-label="Loading record"
      className="flex w-64 items-center gap-3"
    >
      <Skeleton className="size-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  ),
}
export const Table: Story = {
  render: () => (
    <div
      role="status"
      aria-label="Loading table"
      className="w-[min(40rem,90vw)] divide-y divide-border"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-8 py-4">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      ))}
    </div>
  ),
}
