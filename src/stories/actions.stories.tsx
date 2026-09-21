import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowRight, Copy, MoreHorizontal, Plus } from 'lucide-react'

import { Button, InlineAction } from '@/components/button'
import { ActionGroup } from '@/components/design-system-v1/action-group'
import { CopyableValue } from '@/components/design-system-v1/copyable-value'
import { IconButton } from '@/components/icon-button'

const meta = {
  title: 'Components/Button',
  parameters: {
    docs: {
      description: {
        component:
          'Import Button and InlineAction from @/components/button. Loading preserves action geometry and prevents repeat activation; use a secondary action for safe cancellation.',
      },
    },
  },
  component: Button,
  args: {
    children: 'Continue',
    disabled: false,
    loading: false,
    size: 'default',
    tone: 'primary',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['micro', 'compact', 'default'] },
    tone: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'quiet', 'destructive'],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const States: Story = {
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => (
    <div className="space-y-8" data-testid="actions-story">
      <ActionGroup>
        <Button leadingIcon={<Plus aria-hidden="true" />}>Create DTF</Button>
        <Button
          tone="secondary"
          trailingIcon={<ArrowRight aria-hidden="true" />}
        >
          View details
        </Button>
        <Button tone="quiet">Cancel</Button>
        <Button tone="destructive">Delete</Button>
      </ActionGroup>
      <ActionGroup>
        <Button loading>Saving</Button>
        <Button disabled>Unavailable</Button>
        <IconButton label="More actions" icon={<MoreHorizontal />} />
        <IconButton label="Copy address" icon={<Copy />} tone="quiet" />
      </ActionGroup>
      <div className="flex flex-wrap items-center gap-6">
        <InlineAction>Review transaction</InlineAction>
        <CopyableValue value="0x0000000000000000000000000000000000000001" />
      </div>
    </div>
  ),
}
