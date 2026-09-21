import { Spinner } from '@/components/design-system-v1/loading'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Metric } from '@/components/metric'

const meta = {
  title: 'Components/Metric',
  parameters: {
    docs: {
      description: {
        component: '`@/components/metric`',
      },
    },
  },
  component: Metric,
  args: {
    label: 'Market cap',
    role: 'inline',
    value: '$124.8M',
  },
  argTypes: {
    role: { control: 'inline-radio', options: ['inline', 'headline'] },
  },
  decorators: [
    (Story) => (
      <div className="w-72 bg-card p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Metric>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const MissingValue: Story = {
  args: { label: '24h performance', value: '—' },
}

export const Zero: Story = { args: { value: '$0.00' } }
export const Loading: Story = {
  args: { value: <Spinner label="Loading market cap" /> },
}
export const LongValue: Story = { args: { value: '$12,482,091,384.82' } }
