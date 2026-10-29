import { PlaygroundDocs } from '../shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/button'
import { v1LayoutRecipes as layout } from '@/components/ui/v1-layout-recipes'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/design-system-v1/popover'
const meta = {
  title: 'Components/Feedback and overlays/Popover',
  component: PopoverContent,
  args: { side: 'bottom', align: 'center' },
  argTypes: {
    side: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left'],
    },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/design-system-v1/popover` · Use for supporting content anchored to a trigger. It is not a replacement for a Dialog or a long task flow. Give the content an accessible name with `aria-label`. Text content uses the 16px nested-content inset; a list of options uses the 8px popup inset with its own rows. The shell caps width at 320px.',
      },
    },
  },
  render: (args) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button tone="secondary">View mandate</Button>
      </PopoverTrigger>
      <PopoverContent
        {...args}
        aria-label="Mandate"
        className={layout.inset.nestedContent}
      >
        Maintain diversified exposure to established crypto assets.
      </PopoverContent>
    </Popover>
  ),
} satisfies Meta<typeof PopoverContent>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {
  tags: ['!dev'],
}
