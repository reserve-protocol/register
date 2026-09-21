import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/button'
import { ActionGroup } from '@/components/design-system-v1/action-group'
const meta = {
  title: 'Components/Action group',
  component: ActionGroup,
  args: { direction: 'horizontal' },
  argTypes: {
    direction: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Import ActionGroup from @/components/design-system-v1/action-group. Use primary/secondary hierarchy; vertical groups keep equal full-width actions.',
      },
    },
  },
  render: (args) => (
    <ActionGroup {...args}>
      <Button tone="secondary">Cancel</Button>
      <Button>Continue</Button>
    </ActionGroup>
  ),
} satisfies Meta<typeof ActionGroup>
export default meta
type Story = StoryObj<typeof meta>
export const Horizontal: Story = {}
export const Vertical: Story = { args: { direction: 'vertical' } }
