import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'
import { HEADLINE } from '../mock/ugly-cash-series'
import ActivityChart, { CategoryChips } from '../shared/activity-chart'
import { MetricToggle, RangeTabs } from '../shared/activity-controls'
import BalanceHeroChart from '../shared/balance-hero-chart'
import {
  CountriesSection,
  UglyCashCardSection,
} from '../shared/uglycash-sections'
import { countCompact, usd, usdCompact } from '../shared/format'
import {
  DataNote,
  FintechCta,
  FloatingStats,
  SandFrame,
  UglyCashLogo,
} from '../shared/page-bits'
import { RANGE_LABEL, useActivity } from '../shared/use-activity'

const Hero = () => (
  <div className="container h-[420px] px-0 sm:h-[620px] md:px-6">
    <div className="relative flex h-full flex-col justify-end">
      <div className="h-[200px] sm:h-[420px]">
        <BalanceHeroChart />
      </div>
      <div className="absolute left-0 right-3 top-3 w-auto px-4 text-tvl sm:top-8 sm:w-[640px] sm:px-6 md:px-0">
        <div className="flex items-center gap-3">
          <UglyCashLogo className="h-4 sm:h-5" />
        </div>
        <h1 className="mt-5 max-w-[620px] text-2xl font-normal leading-tight sm:text-[32px]">
          The dollar app Latin America uses runs on eUSD
        </h1>
        <p className="mb-4 mt-6 text-base font-light leading-none sm:text-xl">
          eUSD held in UGLYCASH
        </p>
        <div className="flex items-center">
          <p className="text-4xl font-semibold leading-none tabular-nums sm:text-[60px]">
            {usd(HEADLINE.balance)}
          </p>
          <a
            href="#activity"
            aria-label="See eUSD activity"
            className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-tvl/10 text-tvl transition-colors hover:bg-primary/20 sm:h-11 sm:w-11"
          >
            <ArrowRight className="-rotate-45" size={24} />
          </a>
        </div>
        <p className="mt-5 flex gap-2 text-base leading-none sm:text-xl">
          <span className="font-light">eUSD moved in the last 30 days:</span>
          <span className="font-bold tabular-nums">
            {usdCompact(HEADLINE.volume30d)}
          </span>
        </p>
        <Button
          variant="outline-primary"
          className="mt-6 flex h-8 items-center gap-[6px] rounded-[50px] border border-primary p-1 hover:bg-primary"
          onClick={() =>
            document
              .getElementById('meet')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          <span className="ml-2 text-base">What is UGLYCASH?</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
            <Play size={14} className="text-white" fill="#fff" />
          </span>
        </Button>
      </div>
    </div>
  </div>
)

const Activity = () => {
  const activity = useActivity('All')
  const isVolume = activity.metric === 'volume'
  return (
    <section
      id="activity"
      className="container px-4 md:px-6 mt-24 scroll-mt-24"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-light text-tvl sm:text-xl">
            {isVolume
              ? 'eUSD volume in UGLYCASH'
              : 'eUSD transactions in UGLYCASH'}
          </h2>
          <p className="text-4xl font-semibold leading-none text-tvl tabular-nums sm:text-5xl">
            {isVolume ? usd(activity.total) : countCompact(activity.total, 2)}
            <span className="ml-3 text-xl font-light text-legend">
              {RANGE_LABEL[activity.range]}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetricToggle activity={activity} />
          <RangeTabs activity={activity} />
        </div>
      </div>
      <ActivityChart activity={activity} className="mt-8" />
      <div className="mt-6">
        <CategoryChips activity={activity} />
      </div>
    </section>
  )
}

const V1Classic = () => (
  <div className="pb-48">
    <Hero />
    <UglyCashCardSection />
    <Activity />
    <CountriesSection />
    <div className="container px-4 md:px-6 mt-24 flex flex-col gap-6">
      <SandFrame innerClassName="p-0 sm:p-0">
        <FintechCta />
      </SandFrame>
      <DataNote />
    </div>
    <FloatingStats />
  </div>
)

export default V1Classic
