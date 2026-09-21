import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/design-system-v1/popover'
const meta = {
  title: 'Components/Popover',
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
      description: {
        component:
          'Import Popover primitives from @/components/design-system-v1/popover. Anchored supporting content uses the canonical surface and collision behavior.',
      },
    },
  },
  render: (args) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button tone="secondary">View mandate</Button>
      </PopoverTrigger>
      <PopoverContent {...args} className="p-4">
        Maintain diversified exposure to established crypto assets.
      </PopoverContent>
    </Popover>
  ),
} satisfies Meta<typeof PopoverContent>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
