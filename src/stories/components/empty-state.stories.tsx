import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
const meta = {
  title: 'Components/Empty state',
  component: EmptyState,
  args: {
    title: 'No proposals yet',
    description: 'Governance proposals will appear here.',
    mode: 'quiet',
    icon: <Inbox />,
  },
  argTypes: {
    icon: { control: false },
    actions: { control: false },
    mode: { control: 'inline-radio', options: ['quiet', 'actionable'] },
  },
  parameters: {
    docs: {
      description: {
        component: '`@/components/empty-state`',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[min(32rem,90vw)] py-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>
export default meta
type Story = StoryObj<typeof meta>
export const Quiet: Story = {}
export const Actionable: Story = {
  args: { mode: 'actionable', actions: <Button>Create proposal</Button> },
}
export const FilteredToZero: Story = {
  args: {
    title: 'No matching proposals',
    description: 'Try different filters.',
    actions: <Button tone="secondary">Clear filters</Button>,
  },
}
