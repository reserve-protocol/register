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
import { FocusedDocs } from '../../shared/focused-docs'
import { centeredStoryDecorator } from '../../shared/story-surface'

type Family =
  | 'home'
  | 'discover'
  | 'yield-price'
  | 'yield-metrics'
  | 'portfolio'
type Args = {
  family: Family
  metric: 'price' | 'apy' | 'supply' | 'staked-rsr'
  priceEmpty: boolean
  metricEmpty: boolean
  portfolioEmpty: boolean
  composition: boolean
  width: 'full' | 'narrow' | '390px'
}
function ProductChart({
  family,
  metric,
  priceEmpty,
  metricEmpty,
  portfolioEmpty,
  composition,
  width,
}: Args) {
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
          empty={portfolioEmpty}
          sourceState={composition ? 'composition' : 'total'}
        />
      </div>
    )
  const selected = (family === 'yield-price' ? priceEmpty : metricEmpty)
    ? emptyMetric
    : historicalMetrics.find(
        (item) => item.id === (family === 'yield-price' ? 'price' : metric)
      )!
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
  title: 'Patterns/Market/Charts/Product families',
  component: ProductChart,
  decorators: [centeredStoryDecorator],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => <FocusedDocs of={Home} />,
      description: {
        component: 'Home, Discover, Yield and Portfolio charts.',
      },
    },
  },
  args: {
    family: 'home',
    metric: 'price',
    priceEmpty: false,
    metricEmpty: false,
    portfolioEmpty: false,
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
      if: { arg: 'family', eq: 'yield-metrics' },
    },
    priceEmpty: {
      name: 'empty',
      control: 'boolean',
      if: { arg: 'family', eq: 'yield-price' },
    },
    metricEmpty: {
      name: 'empty',
      control: 'boolean',
      if: { arg: 'family', eq: 'yield-metrics' },
    },
    portfolioEmpty: {
      name: 'empty',
      control: 'boolean',
      if: { arg: 'family', eq: 'portfolio' },
    },
    composition: {
      control: 'boolean',
      if: { arg: 'family', eq: 'portfolio' },
    },
    width: { control: 'inline-radio', options: ['full', 'narrow', '390px'] },
  },
} satisfies Meta<typeof ProductChart>
export default meta
type Story = StoryObj<typeof meta>
export const Home: Story = {}
export const Discover: Story = { args: { family: 'discover' } }
export const YieldPrice: Story = {
  name: 'Yield price',
  args: { family: 'yield-price' },
}
export const YieldPriceEmpty: Story = {
  name: 'Yield price empty',
  args: { family: 'yield-price', priceEmpty: true },
}
export const YieldApy: Story = {
  name: 'Yield APY',
  args: { family: 'yield-metrics', metric: 'apy' },
}
export const YieldSupply: Story = {
  name: 'Yield supply',
  args: { family: 'yield-metrics', metric: 'supply' },
}
export const YieldStakedRsr: Story = {
  name: 'Yield staked RSR',
  args: { family: 'yield-metrics', metric: 'staked-rsr' },
}
export const YieldEmpty: Story = {
  name: 'Yield empty',
  args: { family: 'yield-metrics', metricEmpty: true },
}
export const PortfolioTotal: Story = {
  name: 'Portfolio total',
  args: { family: 'portfolio' },
}
export const PortfolioComposition: Story = {
  name: 'Portfolio composition',
  args: { family: 'portfolio', composition: true },
}
export const PortfolioEmpty: Story = {
  name: 'Portfolio empty',
  args: { family: 'portfolio', portfolioEmpty: true },
}
export const PortfolioNarrow: Story = {
  name: 'Portfolio narrow',
  args: { family: 'portfolio', width: 'narrow' },
}
export const YieldMobile390: Story = {
  name: 'Yield, phone width (390px)',
  args: { family: 'yield-metrics', metric: 'apy', width: '390px' },
}
