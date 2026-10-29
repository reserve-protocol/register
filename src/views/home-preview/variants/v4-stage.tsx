import { useMemo } from 'react'
import uglycashCard from '../assets/uglycash-card.png'
import {
  ACTIVE_COUNTRIES,
  HEADLINE,
  SERIES,
  weekly,
} from '../mock/ugly-cash-series'
import ActiveMap from '../shared/active-map'
import { MetricToggle, RangeTabs } from '../shared/activity-controls'
import ColorActivityChart, { ColorLegend } from '../shared/color-activity-chart'
import { countCompact, usd, usdCompact } from '../shared/format'
import ModernArea from '../shared/modern-area'
import {
  BalanceGlassTooltip,
  GradientCard,
  StageFrame,
} from '../shared/modern-bits'
import {
  DataNote,
  FintechCta,
  FloatingStats,
  UglyCashLogo,
} from '../shared/page-bits'
import { RANGE_LABEL, useActivity } from '../shared/use-activity'

const growth = Math.round(
  (HEADLINE.volume30d / HEADLINE.volume30dPrev - 1) * 100
)

const EusdPill = () => (
  <div className="flex items-center gap-3 rounded-full border-2 border-primary bg-card py-2 pl-2 pr-6">
    <img src="/svgs/eusd.svg" alt="" aria-hidden="true" className="h-12 w-12" />
    <div className="flex flex-col text-left leading-tight">
      <span className="text-primary">eUSD in UGLYCASH</span>
      <span className="text-sm tabular-nums">{usd(HEADLINE.balance)}</span>
    </div>
  </div>
)

const MetricCard = ({
  title,
  value,
  note,
  children,
}: {
  title: string
  value: string
  note: string
  children: React.ReactNode
}) => (
  <GradientCard className="flex min-h-[300px] flex-col">
    <div className="flex flex-col gap-1 p-6 pb-2">
      <h2 className="text-xl">{title}</h2>
      <p className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold text-primary tabular-nums">
          {value}
        </span>
        <span className="text-success">{note}</span>
      </p>
    </div>
    <div className="mt-auto h-[170px]">{children}</div>
  </GradientCard>
)

const Hero = () => {
  const weeks = useMemo(() => weekly(SERIES), [])
  return (
    <StageFrame>
      <div className="grid gap-1 xl:min-h-[calc(100svh-72px-8px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl bg-background p-6 py-16 text-center lg:pb-40">
          <EusdPill />
          <h1 className="max-w-[460px] text-[32px] font-normal leading-[1.25] text-primary md:text-4xl">
            The dollar Latin America uses every day runs on eUSD
          </h1>
          <p className="flex flex-col gap-0.5 text-xl leading-[1.25]">
            <span>UGLYCASH is the car.</span>
            <span className="font-medium">eUSD is the battery.</span>
          </p>
        </div>
        <div className="grid gap-1 sm:grid-cols-2">
          <MetricCard
            title="eUSD held"
            value={usdCompact(HEADLINE.balance)}
            note="since launch"
          >
            <ModernArea
              data={SERIES}
              dataKey="balance"
              tooltip={<BalanceGlassTooltip />}
            />
          </MetricCard>
          <MetricCard
            title="eUSD moved, 30 days"
            value={usdCompact(HEADLINE.volume30d)}
            note={`+${growth}%`}
          >
            <ModernArea data={weeks} dataKey="totalVolume" />
          </MetricCard>
          <MetricCard
            title="Transactions, 30 days"
            value={countCompact(HEADLINE.count30d)}
            note="weekly since launch"
          >
            <ModernArea data={weeks} dataKey="totalCount" />
          </MetricCard>
          <GradientCard className="flex min-h-[300px] flex-col">
            <div className="flex flex-col gap-1 p-6 pb-2">
              <h2 className="text-xl">Live across the Americas</h2>
              <p className="text-3xl font-semibold text-primary">
                {ACTIVE_COUNTRIES.length} countries
              </p>
            </div>
            <div className="mt-auto flex justify-center px-6 pb-6">
              <ActiveMap crop="americas" className="max-h-[220px]" />
            </div>
          </GradientCard>
        </div>
      </div>
    </StageFrame>
  )
}

const Meet = () => (
  <section className="container mt-24 px-4 md:px-6">
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="flex flex-col gap-5">
        <UglyCashLogo className="h-6 self-start" />
        <h2 className="text-3xl font-normal leading-tight text-primary sm:text-[40px]">
          Meet UGLYCASH, the dollar account built for Latin America
        </h2>
        <p className="max-w-[46ch] text-lg font-light">
          Get paid from abroad, send money home, save and pay with a Visa card.
          UGLYCASH holds every one of those dollars as eUSD, the stablecoin
          built on Reserve.
        </p>
      </div>
      <GradientCard className="flex items-center justify-center p-12">
        <img
          src={uglycashCard}
          alt="The UGLYCASH Visa card"
          width={500}
          height={315}
          className="w-full max-w-[420px] -rotate-6 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.25)] transition-transform duration-500 hover:rotate-0"
        />
      </GradientCard>
    </div>
  </section>
)

const Activity = () => {
  const activity = useActivity('All')
  const isVolume = activity.metric === 'volume'
  return (
    <section className="container mt-24 px-4 md:px-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl text-primary">
            Every eUSD transaction in UGLYCASH
          </h2>
          <p className="text-4xl font-semibold leading-none text-primary tabular-nums sm:text-5xl">
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
      <div className="mt-8 rounded-4xl border-[4px] border-secondary bg-secondary">
        <div className="rounded-3xl bg-background p-4 sm:p-8">
          <ColorActivityChart activity={activity} type="bar" />
        </div>
        <ColorLegend activity={activity} className="p-4" />
      </div>
      <DataNote className="mt-4" />
    </section>
  )
}

const V4Stage = () => (
  <div className="pb-48">
    <Hero />
    <Meet />
    <Activity />
    <div className="container mt-24 px-4 md:px-6">
      <div className="rounded-4xl border-[4px] border-secondary bg-secondary">
        <FintechCta />
      </div>
    </div>
    <FloatingStats hideAfter={400} />
  </div>
)

export default V4Stage
