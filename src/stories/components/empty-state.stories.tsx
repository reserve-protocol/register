import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
const meta = {
  title: 'Components/Feedback and overlays/Empty state',
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
    size: { control: 'inline-radio', options: ['region', 'page'] },
    titleAs: { control: 'inline-radio', options: ['p', 'h2', 'h3'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          '`@/components/empty-state` · Use for a true absence, a filter with zero matches or a search with no results, and name the cause in the title. Quiet is the default for an expected absence inside a region; tables use it without an icon. Actionable leads with the next step when one exists, such as Clear filters. Page size is for a page whose sections all hide when empty: a section-title heading (h2 by default; set `titleAs` to fit the outline) and actions that stack full width on phones. Loading uses Skeleton; unavailable, permission-blocked and error states use Inline message.',
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
  name: 'Filtered to zero',
  args: {
    title: 'No matching proposals',
    description: 'Try different filters.',
    actions: <Button tone="secondary">Clear filters</Button>,
  },
}
export const Page: Story = {
  name: 'Page level',
  args: {
    mode: 'actionable',
    size: 'page',
    icon: undefined,
    title: 'No Reserve activity found in this wallet',
    description:
      'This wallet does not currently hold any DTFs, staked RSR, vote-locked positions, rewards, pending withdrawals, or active governance activity.',
    actions: (
      <>
        <Button>Explore DTFs</Button>
        <Button tone="secondary">Participate and earn</Button>
      </>
    ),
  },
}
