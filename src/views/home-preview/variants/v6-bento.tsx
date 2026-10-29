import uglycashCard from '../assets/uglycash-card.png'
import { ACTIVE_COUNTRIES, HEADLINE, SERIES } from '../mock/ugly-cash-series'
import ActiveMap from '../shared/active-map'
import { MetricToggle, RangeTabs } from '../shared/activity-controls'
import ColorActivityChart, { ColorLegend } from '../shared/color-activity-chart'
import CountUp from '../shared/count-up'
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

const ActivityTile = () => {
  const activity = useActivity('6M')
  const isVolume = activity.metric === 'volume'
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-background p-6 lg:col-span-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl">
            eUSD {isVolume ? 'volume' : 'transactions'} by type
          </h2>
          <p className="mt-1 text-3xl font-semibold text-primary tabular-nums">
            {isVolume
              ? usdCompact(activity.total)
              : countCompact(activity.total, 2)}
            <span className="ml-2 text-base font-light text-legend">
              {RANGE_LABEL[activity.range]}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetricToggle activity={activity} />
          <RangeTabs activity={activity} />
        </div>
      </div>
      <ColorActivityChart
        activity={activity}
        type="bar"
        className="sm:h-[340px]"
      />
      <ColorLegend activity={activity} />
    </div>
  )
}

const V6Bento = () => (
  <div className="pb-48">
    <StageFrame>
      <div className="grid gap-1 lg:grid-cols-6">
        <div className="relative flex min-h-[520px] flex-col overflow-hidden rounded-3xl bg-background lg:col-span-4 lg:row-span-2">
          <div className="relative z-10 flex flex-col gap-3 p-6 sm:p-10">
            <h1 className="max-w-[560px] text-[28px] font-normal leading-[1.2] text-primary md:text-4xl">
              Latin America's dollars run on eUSD
            </h1>
            <p className="mt-4 text-lg font-light text-primary">
              eUSD held in UGLYCASH
            </p>
            <p className="text-5xl font-semibold leading-none text-primary sm:text-[60px]">
              <CountUp
                value={HEADLINE.balance}
                format={(v) => usd(Math.round(v))}
              />
            </p>
          </div>
          <div className="mt-auto h-[260px] sm:h-[340px]">
            <ModernArea
              data={SERIES}
              dataKey="balance"
              tooltip={<BalanceGlassTooltip />}
              strokeWidth={3}
            />
          </div>
        </div>
        <GradientCard className="flex flex-col gap-4 p-6 lg:col-span-2">
          <UglyCashLogo className="h-5 self-start" />
          <p className="text-lg">
            The dollar account Latin America uses to get paid, send, save and
            spend. Every dollar inside is eUSD.
          </p>
          <img
            src={uglycashCard}
            alt="The UGLYCASH Visa card"
            width={500}
            height={315}
            className="mt-auto w-[240px] -rotate-3 self-end rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
          />
        </GradientCard>
        <div className="grid grid-cols-2 gap-1 lg:col-span-2">
          <GradientCard className="flex flex-col gap-1 p-6">
            <h2 className="text-legend">Moved, 30 days</h2>
            <p className="text-3xl font-semibold text-primary tabular-nums">
              {usdCompact(HEADLINE.volume30d)}
            </p>
            <p className="text-success">+{growth}%</p>
          </GradientCard>
          <GradientCard className="flex flex-col gap-1 p-6">
            <h2 className="text-legend">Transactions</h2>
            <p className="text-3xl font-semibold text-primary tabular-nums">
              {countCompact(HEADLINE.cumulativeCount, 2)}
            </p>
            <p className="text-legend">since launch</p>
          </GradientCard>
        </div>
        <ActivityTile />
        <div className="flex flex-col gap-4 rounded-3xl bg-background p-6 lg:col-span-2">
          <h2 className="text-xl">
            Live in {ACTIVE_COUNTRIES.length} countries
          </h2>
          <ActiveMap crop="americas" className="mx-auto max-h-[360px]" />
          <p className="text-sm text-legend">{ACTIVE_COUNTRIES.join(' · ')}</p>
        </div>
      </div>
    </StageFrame>
    <div className="container mt-16 flex flex-col gap-4 px-4 md:px-6">
      <div className="rounded-4xl border-[4px] border-secondary bg-secondary">
        <FintechCta />
      </div>
      <DataNote />
    </div>
    <FloatingStats hideAfter={400} />
  </div>
)

export default V6Bento
