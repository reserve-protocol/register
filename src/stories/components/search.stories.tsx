import { PlaygroundDocs } from '../shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { SearchField } from '@/components/design-system-v1/search-field'
import { EmptyState } from '@/components/empty-state'

const meta = {
  title: 'Components/Fields and selection/Search',
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
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/design-system-v1/search-field` · Standalone query entry on the 44px TextInput geometry, with a 16px leading search mark, an optional clear action that returns focus, and a non-interactive loading indicator that keeps the query editable. Results, grouping and empty-result recovery belong to the surrounding composition.',
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
export const Playground: Story = {
  tags: ['!dev'],
}
export const Empty: Story = { args: { value: '' } }
export const Loading: Story = {
  args: { value: 'coinmarketcap', loading: true },
}
export const Disabled: Story = { args: { disabled: true } }
export const NoResults: Story = {
  name: 'No results',
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
