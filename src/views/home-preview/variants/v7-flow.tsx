import uglycashCard from '../assets/uglycash-card.png'
import { ACTIVE_COUNTRIES, HEADLINE, SERIES } from '../mock/ugly-cash-series'
import ActiveMap from '../shared/active-map'
import { EusdFlow } from '../shared/eusd-flow'
import { MetricToggle, RangeTabs } from '../shared/activity-controls'
import ColorActivityChart, { ColorLegend } from '../shared/color-activity-chart'
import { usd, usdCompact } from '../shared/format'
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

const Hero = () => (
  <StageFrame>
    <div className="relative flex flex-col overflow-hidden rounded-3xl bg-background xl:min-h-[calc(100svh-72px-8px)]">
      <div className="flex flex-col items-center px-6 pt-6 text-center">
        <div className="hidden w-full sm:block">
          <EusdFlow />
        </div>
        <h1 className="mt-6 max-w-[620px] text-[32px] font-normal leading-[1.2] text-primary sm:mt-0 md:text-[40px]">
          Every deposit, card swipe and transfer in UGLYCASH runs on eUSD
        </h1>
      </div>
      <div className="relative mt-10 h-[300px] sm:h-[380px] xl:mt-auto">
        <div className="absolute left-6 top-0 z-10 sm:left-10">
          <p className="text-lg font-light text-primary">
            eUSD held in UGLYCASH
          </p>
          <p className="text-4xl font-semibold text-primary tabular-nums sm:text-5xl">
            {usd(HEADLINE.balance)}
          </p>
        </div>
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

const Meet = () => (
  <section className="container mt-24 grid items-stretch gap-1 rounded-4xl border-[4px] border-secondary bg-secondary px-0 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
    <div className="flex flex-col justify-center gap-5 rounded-3xl bg-background p-6 sm:p-12">
      <UglyCashLogo className="h-6 self-start" />
      <h2 className="text-3xl font-normal leading-tight text-primary sm:text-[40px]">
        UGLYCASH is the car. eUSD is the battery.
      </h2>
      <p className="max-w-[48ch] text-lg font-light">
        UGLYCASH is a dollar account for people in {ACTIVE_COUNTRIES.length}{' '}
        Latin American countries, with a Visa card and free transfers. It holds
        every dollar as eUSD, the stablecoin built on Reserve, which is why its
        growth is eUSD's growth.
      </p>
    </div>
    <GradientCard className="flex items-center justify-center p-10">
      <img
        src={uglycashCard}
        alt="The UGLYCASH Visa card"
        width={500}
        height={315}
        className="w-full max-w-[360px] rotate-3 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.25)]"
      />
    </GradientCard>
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
            {isVolume ? 'eUSD volume' : 'eUSD transactions'} by type
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
      <ColorLegend activity={activity} className="mt-6" />
      <ColorActivityChart activity={activity} type="area" className="mt-4" />
      <p className="mt-2 text-sm text-legend">
        Moved in the last 30 days:{' '}
        <span className="font-semibold text-foreground">
          {usdCompact(HEADLINE.volume30d)}
        </span>
      </p>
    </section>
  )
}

const Countries = () => (
  <section className="container mt-24 grid items-center gap-10 px-4 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl font-normal text-primary sm:text-[40px]">
        {ACTIVE_COUNTRIES.length} countries, one dollar
      </h2>
      <p className="text-lg font-light">{ACTIVE_COUNTRIES.join(', ')}.</p>
    </div>
    <ActiveMap crop="world" />
  </section>
)

const V7Flow = () => (
  <div className="pb-48">
    <Hero />
    <Meet />
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

export default V7Flow
