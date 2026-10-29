import { cn } from '@/lib/utils'
import { useState } from 'react'
import uglycashCard from '../assets/uglycash-card.png'
import { ACTIVE_COUNTRIES, HEADLINE, SERIES } from '../mock/ugly-cash-series'
import ActiveMap from '../shared/active-map'
import { MetricToggle, RangeTabs } from '../shared/activity-controls'
import ColorActivityChart, { ColorLegend } from '../shared/color-activity-chart'
import { usd, usdCompact } from '../shared/format'
import ModernArea from '../shared/modern-area'
import {
  BalanceGlassTooltip,
  glassClass,
  StageFrame,
} from '../shared/modern-bits'
import {
  DataNote,
  FintechCta,
  FloatingStats,
  UglyCashLogo,
} from '../shared/page-bits'
import { RANGE_LABEL, useActivity } from '../shared/use-activity'

const Hero = () => (
  <StageFrame>
    <div className="relative flex min-h-[620px] flex-col overflow-hidden rounded-3xl bg-background xl:min-h-[calc(100svh-72px-8px)]">
      <div className="relative z-10 flex flex-col gap-4 p-6 sm:p-10 lg:max-w-[640px]">
        <h1 className="text-[32px] font-normal leading-[1.2] text-primary md:text-[40px]">
          The dollar Latin America spends, saves and sends runs on eUSD
        </h1>
        <p className="mt-4 text-xl font-light text-primary">
          eUSD held in UGLYCASH
        </p>
        <p className="text-5xl font-semibold leading-none text-primary tabular-nums sm:text-[64px]">
          {usd(HEADLINE.balance)}
        </p>
        <p className="text-xl">
          <span className="font-light">Moved in the last 30 days: </span>
          <span className="font-bold tabular-nums">
            {usdCompact(HEADLINE.volume30d)}
          </span>
        </p>
      </div>
      <aside
        className={cn(
          glassClass,
          'relative z-10 mx-6 mb-6 flex max-w-[360px] flex-col gap-4 p-5 sm:mx-10 lg:absolute lg:right-10 lg:top-10 lg:m-0'
        )}
      >
        <UglyCashLogo className="h-5 self-start" />
        <p className="text-base">
          UGLYCASH is the dollar account for Latin America: get paid, send, save
          and spend with a Visa card. Every dollar inside is eUSD.
        </p>
        <img
          src={uglycashCard}
          alt="The UGLYCASH Visa card"
          width={500}
          height={315}
          className="w-[220px] -rotate-3 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
        />
      </aside>
      <div className="mt-auto h-[260px] sm:h-[420px] lg:absolute lg:inset-x-0 lg:bottom-0 lg:h-[62%]">
        <ModernArea
          data={SERIES}
          dataKey="balance"
          tooltip={<BalanceGlassTooltip />}
          strokeWidth={3}
        />
      </div>
    </div>
  </StageFrame>
)

const Activity = () => {
  const activity = useActivity('All')
  const isVolume = activity.metric === 'volume'
  return (
    <section className="container mt-24 px-4 md:px-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl text-primary">
            How eUSD moves through UGLYCASH
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
      <ColorActivityChart activity={activity} type="area" className="mt-8" />
      <ColorLegend activity={activity} className="mt-6" />
    </section>
  )
}

const Countries = () => {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <section className="container mt-24 px-4 md:px-6">
      <div className="relative overflow-hidden rounded-4xl bg-secondary/50 p-6 sm:p-10">
        <ActiveMap crop="world" highlight={hovered} />
        <div
          className={cn(
            glassClass,
            'mt-6 flex flex-col gap-4 p-6 lg:absolute lg:bottom-10 lg:right-10 lg:mt-0 lg:max-w-[420px]'
          )}
        >
          <h2 className="text-3xl font-normal text-primary">
            Live in {ACTIVE_COUNTRIES.length} countries
          </h2>
          <ul className="flex flex-wrap gap-2">
            {ACTIVE_COUNTRIES.map((c) => {
              const key = c === 'Dominican Republic' ? 'Dominican Rep.' : c
              return (
                <li key={c}>
                  <button
                    type="button"
                    onMouseEnter={() => setHovered(key)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(key)}
                    onBlur={() => setHovered(null)}
                    className="h-8 rounded-full bg-card px-3 text-sm transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {c}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

const V5Glass = () => (
  <div className="pb-48">
    <Hero />
    <Activity />
    <Countries />
    <div className="container mt-24 flex flex-col gap-4 px-4 md:px-6">
      <div className="rounded-4xl border-[4px] border-secondary bg-secondary">
        <FintechCta />
      </div>
      <DataNote />
    </div>
    <FloatingStats hideAfter={400} />
  </div>
)

export default V5Glass
