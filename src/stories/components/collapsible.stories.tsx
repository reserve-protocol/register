import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/design-system-v1/collapsible'
const meta = {
  title: 'Components/Collapsible',
  component: Collapsible,
  args: { disabled: false },
  argTypes: { disabled: { control: 'boolean' } },
  parameters: {
    docs: {
      description: {
        component: '`@/components/design-system-v1/collapsible`',
      },
    },
  },
  render: (args) => (
    <Collapsible {...args} className="w-[min(32rem,90vw)]">
      <CollapsibleTrigger cue={{ closed: 'Show', open: 'Hide' }}>
        Advanced settings
      </CollapsibleTrigger>
      <CollapsibleContent>
        These settings control proposal timing and auction limits.
      </CollapsibleContent>
    </Collapsible>
  ),
} satisfies Meta<typeof Collapsible>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Unavailable: Story = { args: { disabled: true } }
