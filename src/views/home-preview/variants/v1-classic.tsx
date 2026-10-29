import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'
import { useState } from 'react'
import uglycashCard from '../assets/uglycash-card.png'
import { ACTIVE_COUNTRIES, HEADLINE } from '../mock/ugly-cash-series'
import ActiveMap from '../shared/active-map'
import ActivityChart, { CategoryChips } from '../shared/activity-chart'
import { MetricToggle, RangeTabs } from '../shared/activity-controls'
import BalanceHeroChart from '../shared/balance-hero-chart'
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

const Meet = () => (
  <div className="container px-4 md:px-6 mt-16">
    <SandFrame innerClassName="p-0 sm:p-0 overflow-hidden">
      <div
        id="meet"
        className="grid scroll-mt-24 gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-12">
          <h2 className="text-3xl font-normal leading-tight text-primary sm:text-[40px]">
            UGLYCASH is the dollar account Latin America actually uses
          </h2>
          <p className="max-w-[46ch] text-lg font-light">
            People in {ACTIVE_COUNTRIES.length} countries use it to get paid,
            send money home, save and pay with a card. Every dollar inside it is
            eUSD, Reserve's overcollateralized stablecoin.
          </p>
          <p className="text-xl font-medium">
            UGLYCASH is the car. eUSD is the battery.
          </p>
        </div>
        <div className="relative flex min-h-[280px] items-center justify-center bg-secondary/60 p-10">
          <img
            src={uglycashCard}
            alt="The UGLYCASH Visa card"
            width={500}
            height={315}
            className="w-full max-w-[420px] -rotate-6 rounded-2xl transition-transform duration-500 hover:rotate-0"
          />
        </div>
      </div>
    </SandFrame>
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

const Countries = () => {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <div className="container px-4 md:px-6 mt-24">
      <SandFrame>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-center">
          <ActiveMap crop="world" highlight={hovered} />
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-normal leading-tight text-primary sm:text-[40px]">
              Live in {ACTIVE_COUNTRIES.length} countries
            </h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-lg font-light">
              {ACTIVE_COUNTRIES.map((c) => (
                <li
                  key={c}
                  tabIndex={0}
                  onMouseEnter={() =>
                    setHovered(
                      c === 'Dominican Republic' ? 'Dominican Rep.' : c
                    )
                  }
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() =>
                    setHovered(
                      c === 'Dominican Republic' ? 'Dominican Rep.' : c
                    )
                  }
                  onBlur={() => setHovered(null)}
                  className="cursor-default rounded outline-none hover:text-primary focus-visible:text-primary"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SandFrame>
    </div>
  )
}

const V1Classic = () => (
  <div className="pb-48">
    <Hero />
    <Meet />
    <Activity />
    <Countries />
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
