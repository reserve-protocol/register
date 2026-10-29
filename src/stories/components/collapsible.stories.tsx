import { PlaygroundDocs } from '../shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/design-system-v1/collapsible'
const meta = {
  title: 'Components/Navigation and disclosure/Collapsible',
  component: Collapsible,
  args: { disabled: false },
  argTypes: { disabled: { control: 'boolean' } },
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/design-system-v1/collapsible` · One independent disclosure on the Accordion trigger, chevron and 180ms motion. The trigger names the hidden subject. The optional Show/Hide cue stays muted at rest, turns primary on hover or focus, and hides below 640px, where the chevron carries the affordance. Coordinated sets use Accordion.',
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
export const Playground: Story = {
  tags: ['!dev'],
}
export const Unavailable: Story = { args: { disabled: true } }
