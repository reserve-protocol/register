import { useArgs } from 'storybook/preview-api'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FocusedDocs } from '../../shared/focused-docs'
import { centeredStoryDecorator } from '../../shared/story-surface'
import { FullChart } from './reference/charts/panels'
import {
  chartSample,
  type ChartRange,
  type ChartScenario,
} from './reference/charts/fixtures'

type Args = {
  range: ChartRange
  scenario: ChartScenario
  width: 'full' | 'narrow' | '390px'
}
function MarketChartState({
  scenario,
  width,
  range,
  onRange,
}: Args & { onRange: (range: ChartRange) => void }) {
  return (
    <div
      className={
        width === '390px'
          ? 'mx-auto max-w-[390px] [container-type:inline-size]'
          : width === 'narrow'
            ? 'mx-auto max-w-[824px] [container-type:inline-size]'
            : 'mx-auto max-w-6xl [container-type:inline-size]'
      }
    >
      <FullChart sample={chartSample(range, scenario)} onRange={onRange} />
    </div>
  )
}
const meta = {
  title: 'Patterns/Market/Charts/Source states',
  decorators: [centeredStoryDecorator],
  render: function Render(args) {
    const [, updateArgs] = useArgs<Args>()
    return (
      <MarketChartState {...args} onRange={(range) => updateArgs({ range })} />
    )
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => <FocusedDocs of={Captured} />,
      description: {
        component: 'Price history with missing, partial and estimated data.',
      },
    },
  },
  args: { range: '1M', scenario: 'captured', width: 'full' },
  argTypes: {
    range: { control: 'inline-radio', options: ['7D', '1M'] },
    scenario: {
      control: 'select',
      options: [
        'captured',
        'neutral',
        'zero',
        'estimated',
        'loading',
        'empty',
        'unavailable',
        'delayed',
        'gapped',
        'single',
        'two',
        'long',
      ],
    },
    width: { control: 'inline-radio', options: ['full', 'narrow', '390px'] },
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Captured: Story = {}
export const Narrow: Story = { args: { width: 'narrow' } }
export const Mobile390: Story = {
  name: 'Phone width (390px)',
  args: { width: '390px' },
}
export const KnownZero: Story = {
  name: 'Known zero',
  args: { scenario: 'zero' },
}
export const UnknownUnavailable: Story = {
  name: 'Unknown unavailable',
  args: { scenario: 'unavailable' },
}
export const EstimatedHistory: Story = {
  name: 'Estimated history',
  args: { scenario: 'estimated' },
}
export const DelayedHistory: Story = {
  name: 'Delayed history',
  args: { scenario: 'delayed' },
}
export const InterruptedHistory: Story = {
  name: 'Interrupted history',
  args: { scenario: 'gapped' },
}
export const OnePoint: Story = {
  name: 'One point',
  args: { scenario: 'single' },
}
export const Loading: Story = { args: { scenario: 'loading' } }
