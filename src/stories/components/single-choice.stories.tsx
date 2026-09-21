import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { SingleChoiceGroup } from '@/components/design-system-v1/single-choice-group'
const meta = {
  title: 'Components/Single choice',
  component: SingleChoiceGroup,
  args: {
    accessibleLabel: 'Auction length',
    value: 'week',
    width: 'content',
    options: [
      { value: 'day', label: '1 day' },
      { value: 'week', label: '1 week' },
      { value: 'month', label: '1 month' },
      { value: 'custom', label: 'Custom', disabled: true },
    ],
  },
  argTypes: {
    width: { control: 'inline-radio', options: ['content', 'full'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Import SingleChoiceGroup from @/components/design-system-v1/single-choice-group. Native radio semantics preserve keyboard selection; constrained tracks reveal the selected option.',
      },
    },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <SingleChoiceGroup
        {...args}
        onValueChange={(value) => updateArgs({ value })}
      />
    )
  },
} satisfies Meta<typeof SingleChoiceGroup>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
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
export const Constrained: Story = {
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
}
