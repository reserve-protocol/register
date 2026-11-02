import { cn } from '@/lib/utils'
import { CollateralAssetAnimationStyles } from '@/views/home/components/highlighted-dtfs/collateral-asset-animation-styles'
import { ArrowRight, Globe2, Play } from 'lucide-react'
import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import uglycashCard from '../assets/uglycash-card.png'
import {
  CATEGORIES,
  GLOBAL_COUNTRIES,
  GLOBAL_COUNTRY_COUNT,
  HEADLINE,
  MonthPoint,
  SERIES,
  monthly,
} from '../mock/ugly-cash-series'
import ActiveMap from './active-map'
import { CATEGORY_COLORS } from './category-colors'
import { EusdFlow } from './eusd-flow'
import { countCompact, monthYear, usd, usdCompact } from './format'
import ModernArea from './modern-area'
import { BalanceGlassTooltip, glassClass } from './modern-bits'
import { UglyCashLogo } from './page-bits'
import { EUSD_ROUTE, HomeCard, HomeTicker } from './card-shell'

export { EUSD_ROUTE, HomeCard, HomeTicker }

const EusdIcon = () => (
  <img src="/svgs/eusd.svg" alt="" aria-hidden="true" className="h-8 w-8" />
)

export const HomeHeldCard = () => (
  <HomeCard
    href={EUSD_ROUTE}
    icon={<EusdIcon />}
    title="eUSD held in UGLYCASH"
    value={usd(HEADLINE.balance)}
    note={`${usdCompact(HEADLINE.balanceStart)} at launch`}
    media={
      <ModernArea
        data={SERIES}
        dataKey="texturedBalance"
        curve="linear"
        strokeWidth={2}
        tooltip={<BalanceGlassTooltip field="texturedBalance" />}
      />
    }
    ticker={[
      { key: 'days', label: `${HEADLINE.daysLive} days`, value: 'live' },
      {
        key: 'tx',
        label: countCompact(HEADLINE.cumulativeCount, 2),
        value: 'transactions',
      },
      {
        key: 'moved',
        label: usdCompact(HEADLINE.cumulativeVolume),
        value: 'volume since launch',
      },
      { key: 'held', label: usdCompact(HEADLINE.balance), value: 'held today' },
    ]}
    description="Every dollar people keep in UGLYCASH is eUSD, the stablecoin built on Reserve."
  />
)

const MonthTooltip = ({
  active,
  payload,
  metric,
}: {
  active?: boolean
  payload?: { payload: MonthPoint & { date: string } }[]
  metric: 'volume' | 'count'
}) => {
  if (!active || !payload?.length) return null
  const m = payload[0].payload
  const fmt = (v: number) =>
    metric === 'volume' ? usd(v) : v.toLocaleString('en-US')
  return (
    <div className={cn(glassClass, 'min-w-[240px] text-sm')}>
      <div className="border-b border-border px-4 py-3">
        {monthYear(`${m.month}-01`)}
        {m.partial && <span className="text-legend"> (to date)</span>}
      </div>
      <div className="flex flex-col gap-1 px-4 py-3">
        {[...CATEGORIES].reverse().map((c) => (
          <div key={c.key} className="flex justify-between gap-6">
            <span className="flex items-center gap-2 text-legend">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: CATEGORY_COLORS[c.key] }}
              />
              {c.label}
            </span>
            <span className="tabular-nums">{fmt(m[metric][c.key])}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t border-border px-4 py-3 font-semibold">
        <span>Total</span>
        <span className="text-primary tabular-nums">
          {fmt(metric === 'volume' ? m.totalVolume : m.totalCount)}
        </span>
      </div>
    </div>
  )
}

const MonthlyBars = ({
  metric,
  stacked,
}: {
  metric: 'volume' | 'count'
  stacked: boolean
}) => {
  const rows = useMemo(
    () =>
      monthly().map((m) => ({
        ...m,
        date: m.month,
        ...m[metric],
        total: metric === 'volume' ? m.totalVolume : m.totalCount,
      })),
    [metric]
  )
  return (
    <div className="h-full px-4 pb-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
          barCategoryGap="16%"
        >
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Tooltip
            content={<MonthTooltip metric={metric} />}
            cursor={{ fill: 'hsl(var(--primary))', fillOpacity: 0.06 }}
            wrapperStyle={{ zIndex: 1000 }}
          />
          {stacked ? (
            CATEGORIES.map((c, i) => (
              <Bar
                key={c.key}
                dataKey={c.key}
                stackId="m"
                fill={CATEGORY_COLORS[c.key]}
                radius={i === CATEGORIES.length - 1 ? [3, 3, 0, 0] : 0}
                isAnimationActive={false}
              />
            ))
          ) : (
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const MonthlyLine = ({ metric }: { metric: 'volume' | 'count' }) => {
  const rows = useMemo(
    () =>
      monthly().map((m) => ({
        ...m,
        date: m.month,
        total: metric === 'volume' ? m.totalVolume : m.totalCount,
      })),
    [metric]
  )
  return (
    <ModernArea
      data={rows}
      dataKey="total"
      curve="linear"
      strokeWidth={2}
      tooltip={<MonthTooltip metric={metric} />}
    />
  )
}

const months = monthly()
const lastFull = months[months.length - 2]
const prevFull = months[months.length - 3]
const monthChange = (a: number, b: number) => {
  const v = a / b - 1
  return `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}% vs ${monthYear(`${prevFull.month}-01`).split(' ')[0]}`
}

export const HomeVolumeCard = ({
  chart = 'line',
}: {
  chart?: 'line' | 'bars'
}) => (
  <HomeCard
    icon={<EusdIcon />}
    title="eUSD volume in UGLYCASH"
    value={`${usd(lastFull.totalVolume)} in ${monthYear(`${lastFull.month}-01`).split(' ')[0]}`}
    note={monthChange(lastFull.totalVolume, prevFull.totalVolume)}
    media={
      chart === 'line' ? (
        <MonthlyLine metric="volume" />
      ) : (
        <MonthlyBars metric="volume" stacked />
      )
    }
    ticker={CATEGORIES.map((c) => ({
      key: c.key,
      label: c.label,
      value: usdCompact(lastFull.volume[c.key]),
      color: CATEGORY_COLORS[c.key],
    }))}
    description={`Monthly volume since launch: ${usdCompact(HEADLINE.cumulativeVolume)} so far. Hover a month for the split by type.`}
  />
)

export const HomeTransactionsCard = ({
  chart = 'line',
}: {
  chart?: 'line' | 'bars'
}) => (
  <HomeCard
    icon={<EusdIcon />}
    title="eUSD transactions in UGLYCASH"
    value={`${lastFull.totalCount.toLocaleString('en-US')} in ${monthYear(`${lastFull.month}-01`).split(' ')[0]}`}
    note={monthChange(lastFull.totalCount, prevFull.totalCount)}
    media={
      chart === 'line' ? (
        <MonthlyLine metric="count" />
      ) : (
        <MonthlyBars metric="count" stacked={false} />
      )
    }
    ticker={CATEGORIES.map((c) => ({
      key: c.key,
      label: c.label,
      value: countCompact(lastFull.count[c.key]),
      color: CATEGORY_COLORS[c.key],
    }))}
    description={`Monthly transactions since launch: ${countCompact(HEADLINE.cumulativeCount, 2)} so far.`}
  />
)

const GlobeIcon = () => (
  <span
    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground"
    aria-hidden="true"
  >
    <Globe2 size={18} strokeWidth={1.75} />
  </span>
)

export const HomeCountriesCard = () => (
  <HomeCard
    icon={<GlobeIcon />}
    title={`Live in ${GLOBAL_COUNTRY_COUNT} countries`}
    value="Americas · Africa · Asia · Oceania"
    mediaClassName="h-[230px]"
    media={
      <div className="flex h-full items-center justify-center px-1">
        <ActiveMap
          dataset="global"
          crop="world"
          className="h-full w-auto max-w-full"
        />
      </div>
    }
    ticker={Object.values(GLOBAL_COUNTRIES)
      .flat()
      .map((label) => ({ key: label, label }))}
    description="Where people can open an UGLYCASH account today."
  />
)

export const HomeUglyCashCard = () => (
  <HomeCard
    href="https://ugly.cash"
    external
    icon={<UglyCashLogo className="h-5 self-start" />}
    title="Meet UGLYCASH"
    value="Get paid, send, save and spend in dollars"
    media={
      <div className="flex h-full items-center justify-center">
        <img
          src={uglycashCard}
          alt="The UGLYCASH Visa card"
          width={500}
          height={315}
          className="w-[62%] max-w-[300px] -rotate-6 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-transform duration-500 group-hover:rotate-0"
        />
      </div>
    }
    ticker={[
      { key: 'card', label: 'Visa card' },
      { key: 'account', label: 'Dollar account' },
      { key: 'transfers', label: 'Global transfers' },
      { key: 'savings', label: 'Savings' },
    ]}
    description="A dollar account and Visa card for people around the world. UGLYCASH is the car. eUSD is the battery."
    action={
      <span
        data-card-action
        className="flex items-center gap-2 self-start text-legend group-hover:text-primary"
      >
        <Play size={14} aria-hidden="true" />
        Watch video
      </span>
    }
  />
)

// The fintech pitch, shown as a card stack: their own card sits on top of UGLYCASH's, both powered by eUSD.
export const HomeFintechCard = () => (
  <HomeCard
    href="mailto:partners@reserve.org"
    icon={<EusdIcon />}
    title="Building a fintech?"
    value="Launch your own dollar app on eUSD"
    media={
      <div className="relative flex h-full items-center justify-center">
        <img
          src={uglycashCard}
          alt=""
          aria-hidden="true"
          width={500}
          height={315}
          className="absolute w-[46%] max-w-[220px] -translate-x-[34%] translate-y-[6%] -rotate-12 rounded-xl opacity-90 shadow-[0_20px_40px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:-translate-x-[46%]"
        />
        <div className="absolute flex aspect-[1.586] w-[46%] max-w-[220px] translate-x-[12%] -translate-y-[4%] rotate-6 flex-col justify-between rounded-xl bg-primary p-3 text-primary-foreground shadow-[0_24px_48px_rgba(1,87,177,0.35)] transition-transform duration-500 group-hover:translate-x-[20%] group-hover:rotate-3">
          <span className="text-xs opacity-80">Your brand</span>
          <span className="text-lg font-semibold leading-none">YOUR APP</span>
          <span className="flex items-center gap-1.5 self-end text-xs">
            <img
              src="/svgs/eusd.svg"
              alt=""
              className="h-4 w-4 rounded-full bg-white"
            />
            eUSD inside
          </span>
        </div>
      </div>
    }
    ticker={[
      { key: 'accounts', label: 'Dollar accounts' },
      { key: 'cards', label: 'Cards' },
      { key: 'transfers', label: 'Transfers' },
      { key: 'savings', label: 'Savings' },
      { key: 'help', label: 'Run it yourself', value: 'or with us' },
    ]}
    description="UGLYCASH runs on eUSD. Your app can too: run it yourself, or we can help you launch."
    action={
      <span className="flex items-center gap-2 self-start font-medium text-primary">
        Talk to us <ArrowRight size={14} aria-hidden="true" />
      </span>
    }
  />
)

// Alternative fintech pitch: a solid primary card with the eUSD flow pouring into "your app".
export const HomeFintechPrimaryCard = () => (
  <a
    href="mailto:partners@reserve.org"
    className="group relative flex min-h-[460px] w-full flex-col justify-between overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground"
  >
    <div className="pointer-events-none absolute inset-x-0 top-6 origin-top scale-[0.6] opacity-95">
      <EusdFlow />
    </div>
    <div className="relative mt-auto flex flex-col gap-3">
      <p className="text-3xl leading-tight">Building a fintech?</p>
      <p className="max-w-[40ch] text-primary-foreground/80">
        Launch your own dollar app on eUSD, the way UGLYCASH did. Run it
        yourself, or we can help.
      </p>
      <span className="mt-2 inline-flex h-11 items-center gap-2 self-start rounded-full bg-card px-5 text-primary transition-transform group-hover:translate-x-1">
        Talk to us <ArrowRight size={16} aria-hidden="true" />
      </span>
    </div>
  </a>
)

export const TickerStyles = CollateralAssetAnimationStyles
