import type { Meta, StoryObj } from '@storybook/react-vite'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
const meta = {
  title: 'Components/Help tooltip',
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
      description: {
        component:
          'Import HelpTooltip from @/components/design-system-v1/help-tooltip. Hover, focus or click to reveal supporting information. The trigger needs its own accessible name.',
      },
    },
  },
} satisfies Meta<typeof HelpTooltip>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const LongContent: Story = {
  args: {
    content:
      'The governance delay gives token holders time to review an approved proposal before its changes take effect. Voting, queueing and execution are separate lifecycle stages.',
  },
}
