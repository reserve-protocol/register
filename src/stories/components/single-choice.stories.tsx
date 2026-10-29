import { PlaygroundDocs } from '../shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { SingleChoiceGroup } from '@/components/design-system-v1/single-choice-group'
const meta = {
  title: 'Components/Fields and selection/Single choice',
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
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/design-system-v1/single-choice-group` · One submitted value from a few peers, on 44px contained-selection geometry. Full width shares the width equally; when peers cannot fit it falls back to horizontal overflow and keeps the selected option in view. Use Segmented control for an immediate mode switch, and Tabs for panels.',
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
export const Playground: Story = {
  tags: ['!dev'],
}
export const FullWidth: Story = {
  name: 'Full width',
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
  name: 'Constrained width',
  args: { width: 'full', value: 'month' },
  parameters: {
    docs: {
      description: {
        story:
          'When peers cannot fit, the group overflows horizontally and scrolls the selected option into view.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
}
