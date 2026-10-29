import { cn } from '@/lib/utils'
import { useState } from 'react'
import uglycashCard from '../assets/uglycash-card.png'
import {
  ACTIVE_COUNTRIES,
  CATEGORIES,
  HEADLINE,
  SERIES,
} from '../mock/ugly-cash-series'
import { MetricToggle, RangeTabs } from '../shared/activity-controls'
import ActiveMap from '../shared/active-map'
import BalanceHeroChart from '../shared/balance-hero-chart'
import { countCompact, usd, usdCompact } from '../shared/format'
import MiniArea from '../shared/mini-area'
import {
  DataNote,
  FintechCta,
  FloatingStats,
  SandFrame,
  UglyCashLogo,
} from '../shared/page-bits'
import { RANGE_LABEL, useActivity } from '../shared/use-activity'

type Lens = 'balance' | 'cumulativeVolume' | 'cumulativeCount'

const LENSES: {
  id: Lens
  tab: string
  label: string
  value: string
  sub: string
}[] = [
  {
    id: 'balance',
    tab: 'Held',
    label: 'eUSD held in UGLYCASH',
    value: usd(HEADLINE.balance),
    sub: `Up from ${usdCompact(HEADLINE.balanceStart)} at launch`,
  },
  {
    id: 'cumulativeVolume',
    tab: 'Moved',
    label: 'eUSD moved through UGLYCASH since launch',
    value: usd(HEADLINE.cumulativeVolume),
    sub: `${usdCompact(HEADLINE.volume30d)} in the last 30 days`,
  },
  {
    id: 'cumulativeCount',
    tab: 'Transactions',
    label: 'eUSD transactions in UGLYCASH since launch',
    value: HEADLINE.cumulativeCount.toLocaleString('en-US'),
    sub: `${countCompact(HEADLINE.count30d)} in the last 30 days`,
  },
]

const Hero = () => {
  const [lens, setLens] = useState<Lens>('balance')
  const current = LENSES.find((l) => l.id === lens)!
  return (
    <div className="container h-[460px] px-0 sm:h-[660px] md:px-6">
      <div className="relative flex h-full flex-col justify-end">
        <div className="h-[200px] sm:h-[400px]" key={lens}>
          <BalanceHeroChart data={SERIES} dataKey={lens} />
        </div>
        <div className="absolute left-0 right-3 top-3 px-4 text-tvl sm:top-8 sm:px-6 md:px-0">
          <h1 className="max-w-[640px] text-2xl font-light leading-tight sm:text-[32px]">
            Latin America runs on eUSD. Here is the proof.
          </h1>
          <div
            role="tablist"
            aria-label="Choose a metric"
            className="mt-6 flex gap-1"
          >
            {LENSES.map((l) => (
              <button
                key={l.id}
                role="tab"
                aria-selected={l.id === lens}
                onClick={() => setLens(l.id)}
                className={cn(
                  'h-9 rounded-full px-4 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  l.id === lens
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-tvl/10 hover:bg-tvl/20'
                )}
              >
                {l.tab}
              </button>
            ))}
          </div>
          <p className="mt-6 text-base font-light leading-none sm:text-xl">
            {current.label}
          </p>
          <p
            key={lens}
            className="mt-3 animate-in fade-in slide-in-from-bottom-1 text-4xl font-semibold leading-none tabular-nums duration-500 sm:text-[60px]"
          >
            {current.value}
          </p>
          <p className="mt-4 text-base sm:text-xl">{current.sub}</p>
        </div>
      </div>
    </div>
  )
}

const Meet = () => (
  <div className="container mt-20 px-4 md:px-6">
    <SandFrame innerClassName="p-0 sm:p-0 overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-6 p-6 sm:p-12">
          <UglyCashLogo className="h-6 self-start" />
          <h2 className="text-3xl font-normal leading-tight text-primary sm:text-[40px]">
            The app where Latin America keeps its dollars
          </h2>
          <p className="max-w-[44ch] text-lg font-light">
            Get paid from abroad, send money to family, save and spend with a
            Visa card. Under the hood, every dollar is eUSD, the stablecoin
            built on Reserve.
          </p>
          <img
            src={uglycashCard}
            alt="The UGLYCASH Visa card"
            width={500}
            height={315}
            className="mt-2 w-full max-w-[300px] -rotate-3 rounded-2xl"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 bg-secondary/50 p-6 sm:p-10">
          <ActiveMap crop="americas" className="mx-auto max-h-[520px]" />
          <p className="text-center text-lg">
            Live in{' '}
            <span className="font-semibold text-primary">
              {ACTIVE_COUNTRIES.length} countries
            </span>{' '}
            across the Americas
          </p>
        </div>
      </div>
    </SandFrame>
  </div>
)

const Breakdown = () => {
  const activity = useActivity('All')
  const isVolume = activity.metric === 'volume'
  const fmt = (v: number) => (isVolume ? usdCompact(v) : countCompact(v))
  const ordered = CATEGORIES.map(
    (c) => activity.byCategory.find((b) => b.key === c.key)!
  )
  return (
    <section className="container mt-24 px-4 md:px-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-light text-tvl sm:text-xl">
            How people use eUSD in UGLYCASH
          </h2>
          <p className="text-4xl font-semibold leading-none text-tvl tabular-nums sm:text-5xl">
            {isVolume
              ? usd(activity.total)
              : activity.total.toLocaleString('en-US')}
            <span className="ml-3 text-xl font-light text-legend">
              {isVolume ? 'moved' : 'transactions'}{' '}
              {RANGE_LABEL[activity.range]}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetricToggle activity={activity} />
          <RangeTabs activity={activity} />
        </div>
      </div>
      <div className="mt-8 grid gap-1 rounded-4xl border-[4px] border-secondary bg-secondary sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((c) => (
          <article
            key={c.key}
            className="flex flex-col gap-4 rounded-3xl bg-background p-6"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg">{c.label}</h3>
              <span className="text-sm text-legend tabular-nums">
                {Math.round((c.value / (activity.total || 1)) * 100)}% of total
              </span>
            </div>
            <p className="text-3xl font-semibold text-tvl tabular-nums">
              {fmt(c.value)}
            </p>
            <div className="h-24" key={`${activity.range}-${activity.metric}`}>
              <MiniArea data={activity.rows} dataKey={c.key} />
            </div>
          </article>
        ))}
      </div>
      <DataNote className="mt-4" />
    </section>
  )
}

const V2Lenses = () => (
  <div className="pb-48">
    <Hero />
    <Meet />
    <Breakdown />
    <div className="container mt-24 px-4 md:px-6">
      <SandFrame innerClassName="p-0 sm:p-0">
        <FintechCta />
      </SandFrame>
    </div>
    <FloatingStats />
  </div>
)

export default V2Lenses
