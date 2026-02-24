import type { Meta, StoryObj } from '@storybook/react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './chart'
import type { ChartConfig } from './chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const chartConfig: ChartConfig = {
  tvl: {
    label: 'TVL',
    color: 'hsl(212, 90%, 35%)',
  },
}

const sampleData = [
  { date: 'Jan', tvl: 1200000 },
  { date: 'Feb', tvl: 1350000 },
  { date: 'Mar', tvl: 1100000 },
  { date: 'Apr', tvl: 1500000 },
  { date: 'May', tvl: 1800000 },
  { date: 'Jun', tvl: 2100000 },
  { date: 'Jul', tvl: 1900000 },
  { date: 'Aug', tvl: 2300000 },
  { date: 'Sep', tvl: 2500000 },
  { date: 'Oct', tvl: 2200000 },
  { date: 'Nov', tvl: 2800000 },
  { date: 'Dec', tvl: 3000000 },
]

const meta: Meta<typeof ChartContainer> = {
  title: 'UI/Chart',
  component: ChartContainer,

  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof ChartContainer>

export const AreaChartExample: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <AreaChart data={sampleData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis
          tickFormatter={(value) => `$${(value / 1e6).toFixed(1)}M`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="tvl"
          stroke="var(--color-tvl)"
          fill="var(--color-tvl)"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ChartContainer>
  ),
}

export const MultiSeries: Story = {
  render: () => {
    const multiConfig: ChartConfig = {
      holders: { label: 'Holders APY', color: 'hsl(164, 83%, 40%)' },
      stakers: { label: 'Stakers APY', color: 'hsl(212, 90%, 35%)' },
    }

    const multiData = sampleData.map((d) => ({
      ...d,
      holders: (d.tvl / 1e6) * 0.5,
      stakers: (d.tvl / 1e6) * 1.2,
    }))

    return (
      <ChartContainer config={multiConfig} className="h-64 w-full">
        <AreaChart data={multiData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="holders"
            stroke="var(--color-holders)"
            fill="var(--color-holders)"
            fillOpacity={0.2}
          />
          <Area
            type="monotone"
            dataKey="stakers"
            stroke="var(--color-stakers)"
            fill="var(--color-stakers)"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ChartContainer>
    )
  },
}
