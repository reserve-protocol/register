import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import AreaChart from './AreaChart'
import { withBaseProviders } from '../../../../.storybook/decorators/providers'

const sampleData = Array.from({ length: 30 }, (_, i) => ({
  value: 1 + Math.sin(i / 5) * 0.05 + i * 0.002,
  label: `Jan ${i + 1}`,
  display: `$${(1 + Math.sin(i / 5) * 0.05 + i * 0.002).toFixed(4)}`,
}))

const downData = Array.from({ length: 30 }, (_, i) => ({
  value: 1.1 - i * 0.003 + Math.sin(i / 3) * 0.01,
  label: `Feb ${i + 1}`,
  display: `$${(1.1 - i * 0.003 + Math.sin(i / 3) * 0.01).toFixed(4)}`,
}))

const meta: Meta<typeof AreaChart> = {
  title: 'Components/AreaChart',
  component: AreaChart,
  decorators: [withBaseProviders],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof AreaChart>

export const Default: Story = {
  render: () => (
    <div className="w-[500px]">
      <AreaChart
        data={sampleData}
        title={<span className="font-bold">$1.062</span>}
        heading="eUSD Price"
      />
    </div>
  ),
}

export const WithTimeRange: Story = {
  render: () => {
    const Demo = () => {
      const [range, setRange] = useState('7D')
      return (
        <div className="w-[500px]">
          <AreaChart
            data={sampleData}
            title={<span className="font-bold">$1.062</span>}
            heading="Token Price"
            timeRange={{ '1D': '1D', '7D': '7D', '30D': '30D', All: 'All' }}
            currentRange={range}
            onRangeChange={setRange}
          />
        </div>
      )
    }
    return <Demo />
  },
}

export const Declining: Story = {
  render: () => (
    <div className="w-[500px]">
      <AreaChart
        data={downData}
        title={<span className="font-bold">$1.01</span>}
        heading="Declining Trend"
      />
    </div>
  ),
}

export const Empty: Story = {
  render: () => (
    <div className="w-[500px]">
      <AreaChart
        data={[]}
        title={<span className="font-bold">-</span>}
        heading="No Data"
      />
    </div>
  ),
}

export const Loading: Story = {
  render: () => (
    <div className="w-[500px]">
      <AreaChart
        data={undefined as any}
        title={<span className="font-bold">Loading...</span>}
        heading="Price"
      />
    </div>
  ),
}
