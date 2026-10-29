import { PlaygroundDocs } from '../shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
const meta = {
  title: 'Components/Data display/Lifecycle status',
  component: LifecycleStatusPill,
  args: { role: 'waiting', indicator: 'role', children: 'Pending' },
  argTypes: {
    role: {
      control: 'select',
      options: [
        'waiting',
        'active',
        'actionable',
        'processing',
        'success',
        'unsuccessful',
        'closed',
      ],
    },
    indicator: {
      control: 'select',
      options: ['role', 'voting', 'challenge', 'warning'],
    },
  },
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/lifecycle-status` · The only compact status label: waiting, active, actionable, processing, success, unsuccessful and closed, each with an unframed indicator and opaque tone, plus a separate countdown pill. Only short indeterminate processing animates. It sizes to its content and is not a category label, count or chip.',
      },
    },
  },
} satisfies Meta<typeof LifecycleStatusPill>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {
  tags: ['!dev'],
}
export const Voting: Story = {
  args: { role: 'active', indicator: 'voting', children: 'Voting' },
}
export const Processing: Story = {
  args: { role: 'processing', children: 'Confirming' },
}
export const LongLabel: Story = {
  name: 'Long label',
  args: { role: 'actionable', children: 'Ready for permissionless execution' },
}

export const Roles: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <LifecycleStatusPill role="waiting">Pending</LifecycleStatusPill>
      <LifecycleStatusPill role="active">Active</LifecycleStatusPill>
      <LifecycleStatusPill role="actionable">Action needed</LifecycleStatusPill>
      <LifecycleStatusPill role="processing">Confirming</LifecycleStatusPill>
      <LifecycleStatusPill role="success">Executed</LifecycleStatusPill>
      <LifecycleStatusPill role="unsuccessful">Defeated</LifecycleStatusPill>
      <LifecycleStatusPill role="closed">Closed</LifecycleStatusPill>
    </div>
  ),
}
