import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { MultiSelectFilter } from '@/components/design-system-v1/multi-select-filter'

const meta = {
  title: 'Components/Multi select filter',
  component: MultiSelectFilter,
  args: {
    accessibleLabel: 'Choose networks',
    triggerContent: 'Networks',
    selected: ['ethereum'],
    minSelected: 0,
    onApply: () => {},
    options: [
      { value: 'ethereum', label: 'Ethereum' },
      { value: 'base', label: 'Base' },
      { value: 'bsc', label: 'BNB Smart Chain' },
    ],
  },
  argTypes: {
    minSelected: { control: { type: 'number', min: 0, max: 3 } },
    onApply: { control: false },
    triggerContent: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          '`@/components/design-system-v1/multi-select-filter` Changes take effect on Apply.',
      },
    },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <MultiSelectFilter
        {...args}
        triggerContent={`${args.selected.length} networks`}
        onApply={(selected) => updateArgs({ selected })}
      />
    )
  },
} satisfies Meta<typeof MultiSelectFilter>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Empty: Story = { args: { selected: [] } }
export const MinimumSelection: Story = { args: { minSelected: 1 } }
export const DisabledOption: Story = {
  args: {
    options: [
      { value: 'ethereum', label: 'Ethereum' },
      { value: 'base', label: 'Base', disabled: true },
      { value: 'bsc', label: 'BNB Smart Chain' },
    ],
  },
}
export const LongLabels: Story = {
  args: {
    options: [
      {
        value: 'ethereum',
        label: 'Ethereum — governance and settlement network',
      },
      { value: 'base', label: 'Base — portfolio deployment network' },
      { value: 'bsc', label: 'BNB Smart Chain — portfolio deployment network' },
    ],
  },
}
