import { PlaygroundDocs } from '../shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
const meta = {
  title: 'Components/Feedback and overlays/Help tooltip',
  component: HelpTooltip,
  args: {
    accessibleLabel: 'About governance delay',
    content: 'Changes take effect after the proposal executes.',
    side: 'top',
  },
  argTypes: {
    side: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left'],
    },
  },
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/design-system-v1/help-tooltip` · Explanatory help: a bare 16px glyph 4px from the field or metric label it explains, with a 44px invisible target. It opens on hover, focus, click or touch and wraps at up to 340px. Essential instructions stay visible, never only in a tooltip.',
      },
    },
  },
} satisfies Meta<typeof HelpTooltip>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {
  tags: ['!dev'],
}
export const LongContent: Story = {
  name: 'Long content',
  args: {
    content:
      'The governance delay gives token holders time to review an approved proposal before its changes take effect. Voting, queueing and execution are separate lifecycle stages.',
  },
}
