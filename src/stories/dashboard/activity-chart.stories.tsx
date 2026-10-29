import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'

import { StorySurface } from '../shared/story-surface'
import {
  ActivityChartExample,
  type ActivityChartExampleProps,
} from './activity-chart-example'

const cardSurface: Decorator = (Story) => (
  <StorySurface fullHeight={false}>
    <div className="mx-auto max-w-4xl bg-card">
      <Story />
    </div>
  </StorySurface>
)

const meta = {
  title: 'Dashboard (unreviewed)/Activity chart',
  component: ActivityChartExample,
  decorators: [cardSurface],
  args: {
    measure: 'volume',
    layout: 'stacked',
    state: 'ready',
    initialRange: '30d',
  },
  argTypes: {
    measure: { control: 'inline-radio', options: ['volume', 'count'] },
    layout: { control: 'inline-radio', options: ['stacked', 'diverging'] },
    state: {
      control: 'inline-radio',
      options: ['ready', 'loading', 'empty', 'unavailable'],
    },
    initialRange: {
      name: 'range',
      control: 'inline-radio',
      options: ['7d', '30d', '90d', '1y'],
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '`@/components/design-system-v1/chart-panel` · `category-bar-chart` · Proposal for activity dashboards: one bar per day (weekly at one year), stacked by category in the data series colours. The header and legend show the period total; inspecting a bar with the pointer, a tap or the arrow keys shows that day instead. The current day is drawn lighter and labelled "so far". The panel supplies insets and states but no surface, so it can sit in a card or a flat region. Pass one bucket per UTC day (`start` in unix seconds, `values` per category, `partial` on today); `bucketsForPeriod` groups periods over 90 days into weeks and `formatCompactValue` formats headers, legends and axes. Not an accepted component.',
      },
    },
  },
  render: (args) => (
    <ActivityChartExample
      key={`${args.measure}-${args.initialRange}`}
      {...args}
    />
  ),
} satisfies Meta<ActivityChartExampleProps>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Diverging: Story = {
  name: 'Withdrawals below the baseline',
  args: { layout: 'diverging' },
  parameters: {
    docs: {
      description: {
        story:
          'The same data with withdrawals drawn below zero, so money in and money out read as opposites. Totals still count every transaction.',
      },
    },
  },
}

export const Count: Story = {
  name: 'Transaction count',
  args: { measure: 'count' },
}

export const OneYear: Story = {
  name: 'One year, weekly',
  args: { initialRange: '1y' },
  parameters: {
    docs: {
      description: {
        story:
          'Daily bars become too thin to read over a year, so long ranges group into weeks.',
      },
    },
  },
}

export const OneWeek: Story = {
  name: 'One week',
  args: { initialRange: '7d' },
}

export const Loading: Story = { args: { state: 'loading' } }

export const Empty: Story = { args: { state: 'empty' } }

export const Unavailable: Story = { args: { state: 'unavailable' } }
