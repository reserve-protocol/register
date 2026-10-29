import { Skeleton } from '@/components/design-system-v1/loading'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Metric } from '@/components/metric'
import { PlaygroundDocs } from '../shared/playground-docs'

const meta = {
  title: 'Components/Data display/Metric',
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/metric` · A Metric pairs a label with a formatted value. Its parent owns placement and alignment; zero, missing, and loading are different states, and loading uses a Skeleton bar, not a Spinner. `MetricValue` is the shared seam for formatted numbers: table and record cells use it directly, with tabular numerals, and pair it with their own label (stacked label over value in table facts, label and value as a description list in auction records). Never set a 14px label beside a 16px value on the same row.',
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
    role: {
      control: 'inline-radio',
      options: ['inline', 'headline'],
      description:
        'Inline pairs peers; headline gives the value stronger hierarchy.',
      table: { defaultValue: { summary: 'inline' } },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-muted/40 p-4 dark:bg-muted/20">
        <div className="w-72 bg-card p-5">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Metric>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { tags: ['!dev'] }

export const MissingValue: Story = {
  name: 'Missing value',
  args: { label: '24h performance', value: '—' },
}

export const Zero: Story = { args: { value: '$0.00' } }
export const Loading: Story = {
  args: {
    value: (
      <span role="status" aria-label="Loading market cap" className="block">
        <Skeleton className="h-6 w-24" />
      </span>
    ),
  },
}
export const LongValue: Story = {
  name: 'Long value',
  args: { value: '$12,482,091,384.82' },
}
