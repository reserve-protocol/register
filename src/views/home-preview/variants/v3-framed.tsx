import { Skeleton } from '@/components/ui/skeleton'
import { useHomeMetrics } from '@/views/home/hooks/use-home-metrics'
import { useState } from 'react'
import uglycashCard from '../assets/uglycash-card.png'
import {
  ACTIVE_COUNTRIES,
  HEADLINE,
  MOCK_PROTOCOL_METRICS,
} from '../mock/ugly-cash-series'
import ActiveMap from '../shared/active-map'
import ActivityChart, { CategoryChips } from '../shared/activity-chart'
import { MetricToggle, RangeTabs } from '../shared/activity-controls'
import BalanceHeroChart from '../shared/balance-hero-chart'
import CountUp from '../shared/count-up'
import { countCompact, usd, usdCompact } from '../shared/format'
import { DataNote, FintechCta, UglyCashLogo } from '../shared/page-bits'
import { RANGE_LABEL, useActivity } from '../shared/use-activity'

const Hero = () => (
  <div className="lg:mx-2 2xl:mx-0">
    <div className="grid gap-1 overflow-hidden border-[4px] border-secondary bg-secondary lg:rounded-4xl xl:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
      <div className="flex flex-col justify-between gap-10 rounded-3xl bg-background p-6 sm:p-10">
        <div className="flex items-center gap-3 text-legend">
          <img
            src="/svgs/reserve.svg"
            alt=""
            aria-hidden="true"
            className="h-6 w-6 rounded"
          />
          <span aria-hidden="true">×</span>
          <UglyCashLogo className="h-5" />
        </div>
        <div className="flex flex-col gap-5">
          <h1 className="text-[32px] font-normal leading-[1.2] text-primary md:text-4xl">
            The dollar Latin America saves, sends and spends is eUSD
          </h1>
          <p className="max-w-[42ch] text-lg font-light">
            UGLYCASH gives people in {ACTIVE_COUNTRIES.length} countries a
            dollar account with a Visa card. Every dollar in it is eUSD, built
            on Reserve.
          </p>
        </div>
        <img
          src={uglycashCard}
          alt="The UGLYCASH Visa card"
          width={500}
          height={315}
          className="w-full max-w-[280px] -rotate-3 rounded-2xl"
        />
      </div>
      <div className="relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl bg-background sm:min-h-[560px]">
        <div className="absolute left-6 top-6 z-10 text-tvl sm:left-10 sm:top-10">
          <p className="text-base font-light sm:text-xl">
            eUSD held in UGLYCASH
          </p>
          <p className="mt-3 text-4xl font-semibold leading-none sm:text-[56px]">
            <CountUp
              value={HEADLINE.balance}
              format={(v) => usd(Math.round(v))}
            />
          </p>
          <p className="mt-4 text-base sm:text-lg">
            <span className="font-light">Moved in the last 30 days: </span>
            <span className="font-bold tabular-nums">
              {usdCompact(HEADLINE.volume30d)}
            </span>
          </p>
        </div>
        <div className="h-[220px] sm:h-[360px]">
          <BalanceHeroChart />
        </div>
      </div>
    </div>
  </div>
)

const Figures = () => {
  const { data } = useHomeMetrics()
  const metrics = data ?? MOCK_PROTOCOL_METRICS
  const protocol = [
    { label: 'TVL', value: metrics.tvl },
    { label: 'Est. Partner Revenue', value: metrics.partnerRevenue },
    { label: 'Est. RSR Revenue', value: metrics.rsrAccrual },
    { label: 'Est. Yield Distribution', value: metrics.yieldDistributed },
    { label: 'Mint Volume', value: metrics.mintVolume },
  ]
  const figures = [
    {
      label: 'eUSD moved since launch',
      value: HEADLINE.cumulativeVolume,
      fmt: (v: number) => usdCompact(v),
    },
    {
      label: 'Transactions since launch',
      value: HEADLINE.cumulativeCount,
      fmt: (v: number) => countCompact(v, 2),
    },
    {
      label: 'Countries',
      value: ACTIVE_COUNTRIES.length,
      fmt: (v: number) => String(Math.round(v)),
    },
    {
      label: 'Days live',
      value: HEADLINE.daysLive,
      fmt: (v: number) => String(Math.round(v)),
    },
  ]
  return (
    <section className="container mt-20 px-4 md:px-6">
      <h2 className="sr-only">Key figures</h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {figures.map((f) => (
          <div key={f.label} className="flex flex-col gap-2">
            <span className="text-4xl font-semibold text-tvl sm:text-5xl">
              <CountUp value={f.value} format={f.fmt} />
            </span>
            <span className="text-legend">{f.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-12 flex flex-col gap-4 rounded-3xl bg-secondary/60 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-lg">All of it settles on Reserve</p>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-5">
          {protocol.map((m) => (
            <div key={m.label} className="flex flex-col gap-1">
              <dt className="text-sm text-legend">{m.label}</dt>
              <dd className="font-semibold text-primary tabular-nums">
                {m.value === undefined ? (
                  <Skeleton className="h-5 w-12" />
                ) : (
                  usdCompact(m.value, 0)
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

const Activity = () => {
  const activity = useActivity('All')
  const isVolume = activity.metric === 'volume'
  return (
    <section className="container mt-24 px-4 md:px-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-light text-tvl sm:text-xl">
            {isVolume
              ? 'eUSD volume in UGLYCASH'
              : 'eUSD transactions in UGLYCASH'}
          </h2>
          <p className="text-4xl font-semibold leading-none text-tvl tabular-nums sm:text-5xl">
            {isVolume
              ? usd(activity.total)
              : activity.total.toLocaleString('en-US')}
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
      <div className="mt-6">
        <CategoryChips activity={activity} />
      </div>
      <ActivityChart activity={activity} className="mt-4" />
    </section>
  )
}

const Countries = () => {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <section className="container mt-24 px-4 md:px-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] lg:items-end">
        <ActiveMap crop="world" highlight={hovered} />
        <div>
          <h2 className="text-3xl font-normal text-primary sm:text-[40px]">
            {ACTIVE_COUNTRIES.length} countries and counting
          </h2>
          <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-lg font-light">
            {ACTIVE_COUNTRIES.map((c) => (
              <button
                key={c}
                type="button"
                onMouseEnter={() =>
                  setHovered(c === 'Dominican Republic' ? 'Dominican Rep.' : c)
                }
                onMouseLeave={() => setHovered(null)}
                onFocus={() =>
                  setHovered(c === 'Dominican Republic' ? 'Dominican Rep.' : c)
                }
                onBlur={() => setHovered(null)}
                className="rounded hover:text-primary focus-visible:text-primary focus-visible:outline-none"
              >
                {c}
              </button>
            ))}
          </p>
        </div>
      </div>
    </section>
  )
}

const V3Framed = () => (
  <div className="pb-24">
    <Hero />
    <Figures />
    <Activity />
    <Countries />
    <div className="container mt-24 flex flex-col gap-6 px-4 md:px-6">
      <div className="rounded-4xl border-[4px] border-secondary bg-secondary">
        <FintechCta />
      </div>
      <DataNote />
    </div>
  </div>
)

export default V3Framed
