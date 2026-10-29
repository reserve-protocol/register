import { v1Typography } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/button'
import { ActionGroup } from '@/components/design-system-v1/action-group'
import { OverviewDocs } from '../shared/overview-docs'
const meta = {
  title: 'Components/Actions/Action group',
  tags: ['autodocs', '!dev'],
  component: ActionGroup,
  args: { direction: 'horizontal' },
  argTypes: {
    direction: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  parameters: {
    docs: {
      page: () => (
        <OverviewDocs overview={Behavior} interactive={InteractiveExample} />
      ),
      description: {
        component:
          '`@/components/design-system-v1/action-group` · Groups related actions. Compact and micro actions keep their natural width in horizontal groups; a deliberately vertical default-size group shares the available width.',
      },
    },
  },
} satisfies Meta<typeof ActionGroup>
export default meta
type Story = StoryObj<typeof meta>

export const Behavior: Story = {
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => (
    <div className="grid w-full gap-10 lg:grid-cols-2">
      <section className="space-y-4">
        <header>
          <h2 className={v1Typography.label}>Horizontal · compact</h2>
          <p className={cn(v1Typography.supporting, 'text-muted-foreground')}>
            Intrinsic width
          </p>
        </header>
        <ActionGroup>
          <Button size="compact" tone="secondary">
            Cancel
          </Button>
          <Button size="compact">Continue</Button>
        </ActionGroup>
      </section>
      <section className="space-y-4">
        <header>
          <h2 className={v1Typography.label}>Vertical · default</h2>
          <p className={cn(v1Typography.supporting, 'text-muted-foreground')}>
            Fills its container
          </p>
        </header>
        <ActionGroup direction="vertical">
          <Button tone="secondary">Cancel</Button>
          <Button>Continue</Button>
        </ActionGroup>
      </section>
    </div>
  ),
}

export const InteractiveExample: Story = {
  name: 'Interactive example',
  decorators: [
    (Story) => (
      <div className="w-[min(28rem,80vw)]">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <ActionGroup {...args}>
      <Button tone="secondary">Cancel</Button>
      <Button>Continue</Button>
    </ActionGroup>
  ),
}
