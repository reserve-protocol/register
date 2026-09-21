import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { SearchField } from '@/components/design-system-v1/search-field'
import { EmptyState } from '@/components/empty-state'

const meta = {
  title: 'Components/Search',
  component: SearchField,
  args: {
    'aria-label': 'Search assets',
    value: 'ETH',
    loading: false,
    disabled: false,
  },
  argTypes: {
    value: { control: 'text' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Import SearchField from @/components/design-system-v1/search-field. The field owns query, clear and loading presentation; the caller owns results.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[min(28rem,90vw)]">
        <Story />
      </div>
    ),
  ],
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <SearchField
        {...args}
        onChange={(event) => updateArgs({ value: event.currentTarget.value })}
        onClear={() => updateArgs({ value: '' })}
      />
    )
  },
} satisfies Meta<typeof SearchField>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Empty: Story = { args: { value: '' } }
export const Loading: Story = {
  args: { value: 'coinmarketcap', loading: true },
}
export const Disabled: Story = { args: { disabled: true } }
export const NoResults: Story = {
  args: { value: 'No matching asset' },
  decorators: [
    (Story) => (
      <div className="space-y-6">
        <Story />
        <EmptyState
          title="No assets found"
          description="Try a different name or token address."
        />
      </div>
    ),
  ],
}
