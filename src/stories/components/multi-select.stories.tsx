import { PlaygroundDocs } from '../shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { MultiSelectFilter } from '@/components/design-system-v1/multi-select-filter'

const meta = {
  title: 'Components/Fields and selection/Multi select filter',
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
    triggerClassName: { control: false, table: { disable: true } },
    minSelected: { control: { type: 'number', min: 0, max: 3 } },
    onApply: { control: false },
    triggerContent: { control: false },
  },
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/design-system-v1/multi-select-filter` · Changes take effect on Apply.',
      },
    },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <MultiSelectFilter
        {...args}
        triggerContent={
          args.selected.length === 0
            ? 'All networks'
            : `${args.selected.length} ${args.selected.length === 1 ? 'network' : 'networks'}`
        }
        onApply={(selected) => updateArgs({ selected })}
      />
    )
  },
} satisfies Meta<typeof MultiSelectFilter>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {
  tags: ['!dev'],
}
export const Empty: Story = { args: { selected: [] } }
export const MinimumSelection: Story = {
  name: 'Minimum selection',
  args: { minSelected: 1 },
}
export const DisabledOption: Story = {
  name: 'Disabled option',
  args: {
    options: [
      { value: 'ethereum', label: 'Ethereum' },
      { value: 'base', label: 'Base', disabled: true },
      { value: 'bsc', label: 'BNB Smart Chain' },
    ],
  },
}
export const LongLabels: Story = {
  name: 'Long labels',
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
