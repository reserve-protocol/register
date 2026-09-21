import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  SourceCompactChart,
  SourceHomeChart,
} from './reference/charts/source-small'
import {
  historicalMetrics,
  emptyMetric,
} from './reference/charts/next-families/fixture-data'
import { MetricLineChart } from './reference/charts/next-families/metric-line-chart'
import { YieldPricePilot } from './reference/charts/next-families/yield-price-pilot'
import { PortfolioHistory } from './reference/charts/next-families/portfolio-history'

type Family =
  | 'home'
  | 'discover'
  | 'yield-price'
  | 'yield-metrics'
  | 'portfolio'
type Args = {
  family: Family
  metric: 'price' | 'apy' | 'supply' | 'staked-rsr'
  empty: boolean
  composition: boolean
  width: 'full' | 'narrow' | '390px'
}
function ProductChart({ family, metric, empty, composition, width }: Args) {
  const frame =
    width === '390px'
      ? 'mx-auto max-w-[390px] [container-type:inline-size]'
      : width === 'narrow'
        ? 'mx-auto max-w-[824px] [container-type:inline-size]'
        : 'mx-auto max-w-5xl [container-type:inline-size]'
  if (family === 'home')
    return (
      <div className={frame}>
        <SourceHomeChart />
      </div>
    )
  if (family === 'discover')
    return (
      <div className={frame}>
        <SourceCompactChart />
      </div>
    )
  if (family === 'portfolio')
    return (
      <div className={`${frame} rounded-xl border bg-card py-6`}>
        <PortfolioHistory
          empty={empty}
          sourceState={composition ? 'composition' : 'total'}
        />
      </div>
    )
  const selected = empty
    ? emptyMetric
    : historicalMetrics.find((item) => item.id === metric)!
  return (
    <div className={`${frame} rounded-xl border bg-card py-6`}>
      {family === 'yield-price' ? (
        <YieldPricePilot metric={selected} />
      ) : (
        <MetricLineChart metric={selected} />
      )}
    </div>
  )
}
const meta = {
  title: 'Patterns/Market/Charts/Product Families',
  component: ProductChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Preserved Home, Discover, Yield DTF metric and price, and Portfolio chart compositions using captured local fixtures.',
      },
    },
  },
  args: {
    family: 'home',
    metric: 'price',
    empty: false,
    composition: false,
    width: 'full',
  },
  argTypes: {
    family: {
      control: 'select',
      options: [
        'home',
        'discover',
        'yield-price',
        'yield-metrics',
        'portfolio',
      ],
    },
    metric: {
      control: 'select',
      options: ['price', 'apy', 'supply', 'staked-rsr'],
    },
    empty: { control: 'boolean' },
    composition: { control: 'boolean' },
    width: { control: 'inline-radio', options: ['full', 'narrow', '390px'] },
  },
} satisfies Meta<typeof ProductChart>
export default meta
type Story = StoryObj<typeof meta>
export const Home: Story = {}
export const Discover: Story = { args: { family: 'discover' } }
export const YieldPrice: Story = { args: { family: 'yield-price' } }
export const YieldApy: Story = {
  args: { family: 'yield-metrics', metric: 'apy' },
}
export const YieldSupply: Story = {
  args: { family: 'yield-metrics', metric: 'supply' },
}
export const YieldStakedRsr: Story = {
  args: { family: 'yield-metrics', metric: 'staked-rsr' },
}
export const YieldEmpty: Story = {
  args: { family: 'yield-metrics', empty: true },
}
export const PortfolioTotal: Story = { args: { family: 'portfolio' } }
export const PortfolioComposition: Story = {
  args: { family: 'portfolio', composition: true },
}
export const PortfolioEmpty: Story = {
  args: { family: 'portfolio', empty: true },
}
export const PortfolioNarrow: Story = {
  args: { family: 'portfolio', width: 'narrow' },
}
export const YieldMobile390: Story = {
  args: { family: 'yield-metrics', metric: 'apy', width: '390px' },
}
