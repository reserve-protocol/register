import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
const meta = {
  title: 'Components/Segmented control',
  component: SegmentedControl,
  args: {
    presentation: 'contained',
    size: 'default',
    width: 'intrinsic',
    value: 'week',
    onValueChange: () => {},
  },
  argTypes: {
    presentation: {
      control: 'inline-radio',
      options: ['contained', 'text-only'],
    },
    size: { control: 'inline-radio', options: ['compact', 'default'] },
    width: { control: 'inline-radio', options: ['intrinsic', 'full'] },
    onValueChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: '`@/components/design-system-v1/segmented-control`',
      },
    },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <SegmentedControl
        {...args}
        aria-label="Performance period"
        onValueChange={(value) => updateArgs({ value })}
      >
        <SegmentedControlItem value="day">1D</SegmentedControlItem>
        <SegmentedControlItem value="week">1W</SegmentedControlItem>
        <SegmentedControlItem value="month">1M</SegmentedControlItem>
        <SegmentedControlItem value="year" disabled>
          1Y
        </SegmentedControlItem>
      </SegmentedControl>
    )
  },
} satisfies Meta<typeof SegmentedControl>
export default meta
type Story = StoryObj<typeof meta>
export const Contained: Story = {}
export const TextOnly: Story = {
  args: { presentation: 'text-only', size: 'compact' },
}
export const FullWidth: Story = {
  args: { width: 'full' },
  decorators: [
    (Story) => (
      <div className="w-[min(32rem,90vw)]">
        <Story />
      </div>
    ),
  ],
}
