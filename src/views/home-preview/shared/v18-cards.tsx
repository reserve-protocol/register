import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Globe2 } from 'lucide-react'
import { type RefObject, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CATEGORIES,
  CategoryKey,
  DayPoint,
  GLOBAL_COUNTRIES,
  GLOBAL_COUNTRY_COUNT,
} from '../mock/ugly-cash-series'
import ActiveMap from './active-map'
import { CATEGORY_COLORS } from './category-colors'
import { countCompact, monthYear, shortDate, usd, usdCompact } from './format'
import { AutoTicker, EUSD_ROUTE, HomeCard } from './card-shell'
import { FintechCardV18, UglyCashCardV18 } from './static-cards'

export { AutoTicker, FintechCardV18, UglyCashCardV18 }
import ModernArea from './modern-area'
import { glassClass } from './modern-bits'
import { PeriodPoint, UglycashData, useUglycashData } from './uglycash-data'
import { useReducedMotion } from './use-reduced-motion'

// Cards clip their media, so tooltips render in a portal positioned over the page instead.
const PortalTip = ({
  active,
  coordinate,
  anchor,
  children,
}: {
  active?: boolean
  coordinate?: { x: number; y: number }
  anchor: RefObject<HTMLElement>
  children: React.ReactNode
}) => {
  if (!active || !coordinate || !anchor.current) return null
  const rect = anchor.current.getBoundingClientRect()
  const width = 260
  const x = rect.left + coordinate.x
  const left = x + 16 + width > window.innerWidth ? x - width - 16 : x + 16
  const top = Math.max(
    8,
    Math.min(rect.top + coordinate.y - 60, window.innerHeight - 280)
  )
  return createPortal(
    <div
      className="pointer-events-none fixed z-[1000]"
      style={{ left, top, width }}
    >
      {children}
    </div>,
    document.body
  )
}

const MonthBody = ({
  m,
  metric,
  order,
  categories,
}: {
  m: PeriodPoint
  metric: 'volume' | 'count'
  order?: CategoryKey[]
  categories: UglycashData['categories']
}) => {
  const rows = order
    ? order.map((key) => CATEGORIES.find((c) => c.key === key)!)
    : [...categories].reverse()
  const fmt = (v: number) =>
    metric === 'volume' ? usd(v) : v.toLocaleString('en-US')
  return (
    <div className={cn(glassClass, 'text-sm')}>
      <div className="border-b border-border px-4 py-3">
        {m.label ?? monthYear(`${m.month}-01`)}
        {m.partial && <span className="text-legend"> (to date)</span>}
      </div>
      <div className="flex flex-col gap-1 px-4 py-3">
        {rows.map((c) => (
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

const MonthTip = (props: {
  active?: boolean
  coordinate?: { x: number; y: number }
  payload?: { payload: PeriodPoint }[]
  anchor: RefObject<HTMLElement>
  metric: 'volume' | 'count'
  order?: CategoryKey[]
  categories: UglycashData['categories']
}) => (
  <PortalTip {...props}>
    {props.payload?.[0] && (
      <MonthBody
        m={props.payload[0].payload}
        metric={props.metric}
        order={props.order}
        categories={props.categories}
      />
    )}
  </PortalTip>
)

const BalanceTip = (props: {
  active?: boolean
  coordinate?: { x: number; y: number }
  payload?: { payload: DayPoint }[]
  anchor: RefObject<HTMLElement>
}) => {
  const p = props.payload?.[0]?.payload
  return (
    <PortalTip {...props}>
      {p && (
        <div className={cn(glassClass, 'text-sm')}>
          <div className="border-b border-border px-4 py-3">
            {shortDate(p.date)}
          </div>
          <div className="flex flex-col gap-1 px-4 py-3">
            <div className="flex justify-between gap-6">
              <span className="text-legend">eUSD held</span>
              <span className="font-semibold text-primary tabular-nums">
                {usd(p.texturedBalance)}
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-legend">Volume that day</span>
              <span className="font-semibold tabular-nums">
                {usd(p.totalVolume)}
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-legend">Transactions</span>
              <span className="font-semibold tabular-nums">
                {countCompact(p.totalCount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </PortalTip>
  )
}

const EusdIcon = () => (
  <img src="/svgs/eusd.svg" alt="" aria-hidden="true" className="h-8 w-8" />
)

export const HeldCardV18 = () => {
  const anchor = useRef<HTMLDivElement>(null)
  const { daily, headline: HEADLINE, status } = useUglycashData()
  return (
    <HomeCard
      revealed={status && status === 'ready'}
      href={EUSD_ROUTE}
      icon={<EusdIcon />}
      title="eUSD held in UGLYCASH"
      value={usd(HEADLINE.balance)}
      media={
        <div ref={anchor} className="h-full">
          <ModernArea
            data={daily}
            dataKey="texturedBalance"
            curve="linear"
            strokeWidth={2}
            tooltip={<BalanceTip anchor={anchor} />}
          />
        </div>
      }
      tickerSlot={
        <AutoTicker
          items={[
            { key: 'days', label: `${HEADLINE.daysLive} days`, value: 'live' },
            {
              key: 'tx',
              label: countCompact(HEADLINE.cumulativeCount, 2),
              value: 'transactions',
            },
            {
              key: 'vol',
              label: usdCompact(HEADLINE.cumulativeVolume),
              value: 'volume since launch',
            },
            {
              key: 'held',
              label: usdCompact(HEADLINE.balance),
              value: 'held today',
            },
          ]}
        />
      }
      description="Every dollar people keep in UGLYCASH is eUSD, the stablecoin built on Reserve."
    />
  )
}

type Scale = 'month' | 'week'

// Tooltip rows follow the latest period's ranking, so the order stays the same on every hover.
const latestOrder = (
  last: PeriodPoint,
  metric: 'volume' | 'count',
  categories: UglycashData['categories']
) =>
  [...categories]
    .sort((a, b) => last[metric][b.key] - last[metric][a.key])
    .map((c) => c.key)

const usePeriods = (scale: Scale, metric: 'volume' | 'count') => {
  const data = useUglycashData()
  const all = scale === 'month' ? data.monthly : data.weekly
  const complete = all.filter((p) => !p.partial)
  const last = complete[complete.length - 1]
  const monthName = monthYear(`${last.month}-01`).split(' ')[0]
  return {
    rows: data.hidePartialPeriods ? complete : all,
    last,
    suffix: scale === 'month' ? `in ${monthName}` : 'last week',
    noun: scale === 'month' ? 'Monthly' : 'Weekly',
    categories: data.categoriesByMetric[metric],
    headline: data.headline,
    revealed: data.status && data.status === 'ready',
  }
}

export const VolumeCardV18 = ({
  scale = 'month',
  sortTooltip = false,
}: {
  scale?: Scale
  sortTooltip?: boolean
}) => {
  const anchor = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const {
    rows: periodRows,
    last,
    suffix,
    noun,
    categories,
    headline: HEADLINE,
    revealed,
  } = usePeriods(scale, 'volume')
  const rows = useMemo(
    () => periodRows.map((m) => ({ ...m, ...m.volume })),
    [periodRows]
  )
  return (
    <HomeCard
      icon={<EusdIcon />}
      revealed={revealed}
      title="eUSD volume in UGLYCASH"
      value={`${usd(last.totalVolume)} ${suffix}`}
      media={
        <div ref={anchor} className="h-full px-4 pb-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
              barCategoryGap="16%"
            >
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip
                content={
                  <MonthTip
                    anchor={anchor}
                    metric="volume"
                    categories={categories}
                    order={
                      sortTooltip
                        ? latestOrder(last, 'volume', categories)
                        : undefined
                    }
                  />
                }
                cursor={{ fill: 'hsl(var(--primary))', fillOpacity: 0.06 }}
              />
              {categories.map((c, i) => (
                <Bar
                  key={c.key}
                  dataKey={c.key}
                  stackId="m"
                  fill={CATEGORY_COLORS[c.key]}
                  radius={i === categories.length - 1 ? [3, 3, 0, 0] : 0}
                  isAnimationActive={!reduced}
                  animationDuration={800}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      }
      tickerSlot={
        <AutoTicker
          items={categories.map((c) => ({
            key: c.key,
            label: c.label,
            value: usdCompact(last.volume[c.key]),
            color: CATEGORY_COLORS[c.key],
          }))}
        />
      }
      description={`${noun} volume since launch: ${usdCompact(HEADLINE.cumulativeVolume)} so far. Hover a ${scale} for the split by type.`}
    />
  )
}

export const TransactionsCardV18 = ({
  scale = 'month',
  sortTooltip = false,
}: {
  scale?: Scale
  sortTooltip?: boolean
}) => {
  const anchor = useRef<HTMLDivElement>(null)
  const {
    rows: periodRows,
    last,
    suffix,
    noun,
    categories,
    headline: HEADLINE,
    revealed,
  } = usePeriods(scale, 'count')
  const rows = useMemo(
    () => periodRows.map((m) => ({ ...m, date: m.month, total: m.totalCount })),
    [periodRows]
  )
  return (
    <HomeCard
      icon={<EusdIcon />}
      revealed={revealed}
      title="eUSD transactions in UGLYCASH"
      value={`${last.totalCount.toLocaleString('en-US')} ${suffix}`}
      media={
        <div ref={anchor} className="h-full">
          <ModernArea
            data={rows}
            dataKey="total"
            curve="linear"
            strokeWidth={2}
            tooltip={
              <MonthTip
                anchor={anchor}
                metric="count"
                categories={categories}
                order={
                  sortTooltip
                    ? latestOrder(last, 'count', categories)
                    : undefined
                }
              />
            }
          />
        </div>
      }
      tickerSlot={
        <AutoTicker
          items={categories.map((c) => ({
            key: c.key,
            label: c.label,
            value: countCompact(last.count[c.key]),
            color: CATEGORY_COLORS[c.key],
          }))}
        />
      }
      description={`${noun} transactions since launch: ${countCompact(HEADLINE.cumulativeCount, 2)} so far.`}
    />
  )
}

const GlobeIcon = () => (
  <span
    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground"
    aria-hidden="true"
  >
    <Globe2 size={18} strokeWidth={1.75} />
  </span>
)

// The header has no value line, so the media is taller by that line (text-lg + gap-3) to keep tickers aligned.
export const CountriesCardV18 = () => (
  <HomeCard
    icon={<GlobeIcon />}
    title={`Live in ${GLOBAL_COUNTRY_COUNT} countries`}
    mediaClassName="h-[220px]"
    media={
      <div className="flex h-full items-center justify-center">
        <ActiveMap dataset="global" crop="focus" className="h-full w-full" />
      </div>
    }
    tickerSlot={
      <AutoTicker
        items={Object.values(GLOBAL_COUNTRIES)
          .flat()
          .map((label) => ({ key: label, label }))}
      />
    }
    description="Where people can open an UGLYCASH account today."
  />
)

// Holds the slot of a data card while UGLYCASH metrics load, or says plainly that they are unavailable.
export const DataCardPlaceholder = ({
  title,
  state,
}: {
  title: string
  state: 'loading' | 'error'
}) => (
  <HomeCard
    icon={<EusdIcon />}
    title={title}
    value={state === 'error' ? 'Data unavailable right now' : undefined}
    media={
      state === 'loading' ? (
        <div className="flex h-full flex-col justify-end gap-3 px-5 pb-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-legend">
          UGLYCASH metrics could not be loaded. The rest of the page still
          works.
        </div>
      )
    }
  />
)
