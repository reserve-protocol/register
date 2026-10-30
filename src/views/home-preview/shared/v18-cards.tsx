import { cn } from '@/lib/utils'
import { FEATURE_CARD_ASSET_TICKER_CLASS_NAME } from '@/views/home/components/highlighted-dtfs/constants'
import { ArrowRight, Globe2 } from 'lucide-react'
import {
  type RefObject,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
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
  CategoryKey,
  DayPoint,
  GLOBAL_COUNTRIES,
  GLOBAL_COUNTRY_COUNT,
  HEADLINE,
  MonthPoint,
  SERIES,
  monthly,
  weekly,
} from '../mock/ugly-cash-series'
import ActiveMap from './active-map'
import { CATEGORY_COLORS } from './category-colors'
import { countCompact, monthYear, shortDate, usd, usdCompact } from './format'
import { EUSD_ROUTE, HomeCard } from './home-cards'
import ModernArea from './modern-area'
import { glassClass } from './modern-bits'
import { UglyCashLogo } from './page-bits'
import { useReducedMotion } from './use-reduced-motion'

const TICKER_PX_PER_SECOND = 48

type TickerItem = { key: string; label: string; value?: string; color?: string }

// Always moving at one shared speed: duration follows the measured width of each list.
export const AutoTicker = ({ items }: { items: TickerItem[] }) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [duration, setDuration] = useState(20)

  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    setDuration(Math.max(8, el.scrollWidth / 2 / TICKER_PX_PER_SECOND))
  }, [items])

  return (
    <div className={FEATURE_CARD_ASSET_TICKER_CLASS_NAME}>
      <div className="pointer-events-none absolute inset-y-0 -right-px z-10 w-20 bg-gradient-to-l from-card via-card to-transparent" />
      <div className="flex overflow-hidden pl-2 pr-12">
        <div
          ref={trackRef}
          className="flex w-max gap-0 motion-reduce:[animation:none!important]"
          style={{
            animation: `collateral-assets-scroll ${duration}s linear infinite`,
          }}
        >
          {[...items, ...items].map((item, i) => (
            <div
              key={`${item.key}-${i}`}
              className="flex shrink-0 items-center gap-1 rounded-full px-1.5 py-1"
            >
              {item.color && (
                <span
                  className="ml-1 h-2 w-2 rounded-full"
                  style={{ background: item.color }}
                  aria-hidden="true"
                />
              )}
              <span className="ml-1 text-sm text-foreground">{item.label}</span>
              {item.value && (
                <span className="text-sm text-legend">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <span
        className="absolute right-2 top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-foreground lg:bg-card lg:group-hover:bg-muted"
        aria-hidden="true"
      >
        <ArrowRight size={16} />
      </span>
    </div>
  )
}

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

type PeriodPoint = MonthPoint & { label?: string }

const MonthBody = ({
  m,
  metric,
  order,
}: {
  m: PeriodPoint
  metric: 'volume' | 'count'
  order?: CategoryKey[]
}) => {
  const rows = order
    ? order.map((key) => CATEGORIES.find((c) => c.key === key)!)
    : [...CATEGORIES].reverse()
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
  payload?: { payload: MonthPoint }[]
  anchor: RefObject<HTMLElement>
  metric: 'volume' | 'count'
  order?: CategoryKey[]
}) => (
  <PortalTip {...props}>
    {props.payload?.[0] && (
      <MonthBody
        m={props.payload[0].payload}
        metric={props.metric}
        order={props.order}
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
  return (
    <HomeCard
      href={EUSD_ROUTE}
      icon={<EusdIcon />}
      title="eUSD held in UGLYCASH"
      value={usd(HEADLINE.balance)}
      media={
        <div ref={anchor} className="h-full">
          <ModernArea
            data={SERIES}
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

const months = monthly()
const lastFull = months[months.length - 2]
const monthName = monthYear(`${lastFull.month}-01`).split(' ')[0]

const weeks: PeriodPoint[] = weekly(SERIES).map((w) => ({
  month: w.date,
  volume: w.volume,
  count: w.count,
  totalVolume: w.totalVolume,
  totalCount: w.totalCount,
  partial: false,
  label: `Week of ${shortDate(w.date)}`,
}))

type Scale = 'month' | 'week'

// Tooltip rows follow the latest period's ranking, so the order stays the same on every hover.
const latestOrder = (last: PeriodPoint, metric: 'volume' | 'count') =>
  [...CATEGORIES]
    .sort((a, b) => last[metric][b.key] - last[metric][a.key])
    .map((c) => c.key)

const PERIODS: Record<
  Scale,
  { rows: PeriodPoint[]; last: PeriodPoint; suffix: string; noun: string }
> = {
  month: {
    rows: months,
    last: lastFull,
    suffix: `in ${monthName}`,
    noun: 'Monthly',
  },
  week: {
    rows: weeks,
    last: weeks[weeks.length - 1],
    suffix: 'last week',
    noun: 'Weekly',
  },
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
  const { rows: periodRows, last, suffix, noun } = PERIODS[scale]
  const rows = useMemo(
    () => periodRows.map((m) => ({ ...m, ...m.volume })),
    [periodRows]
  )
  return (
    <HomeCard
      icon={<EusdIcon />}
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
                    order={
                      sortTooltip ? latestOrder(last, 'volume') : undefined
                    }
                  />
                }
                cursor={{ fill: 'hsl(var(--primary))', fillOpacity: 0.06 }}
              />
              {CATEGORIES.map((c, i) => (
                <Bar
                  key={c.key}
                  dataKey={c.key}
                  stackId="m"
                  fill={CATEGORY_COLORS[c.key]}
                  radius={i === CATEGORIES.length - 1 ? [3, 3, 0, 0] : 0}
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
          items={CATEGORIES.map((c) => ({
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
  const { rows: periodRows, last, suffix, noun } = PERIODS[scale]
  const rows = useMemo(
    () => periodRows.map((m) => ({ ...m, date: m.month, total: m.totalCount })),
    [periodRows]
  )
  return (
    <HomeCard
      icon={<EusdIcon />}
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
                order={sortTooltip ? latestOrder(last, 'count') : undefined}
              />
            }
          />
        </div>
      }
      tickerSlot={
        <AutoTicker
          items={CATEGORIES.map((c) => ({
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

export const UglyCashCardV18 = ({ shadow = true }: { shadow?: boolean }) => (
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
          className={cn(
            'w-[62%] max-w-[300px] -rotate-6 rounded-xl transition-transform duration-500 group-hover:rotate-0',
            shadow && 'shadow-[0_20px_40px_rgba(0,0,0,0.2)]'
          )}
        />
      </div>
    }
    tickerSlot={
      <AutoTicker
        items={[
          { key: 'card', label: 'Visa card' },
          { key: 'account', label: 'Dollar account' },
          { key: 'transfers', label: 'Global transfers' },
          { key: 'savings', label: 'Savings' },
        ]}
      />
    }
    description="A dollar account and Visa card for people around the world. UGLYCASH is the car. eUSD is the battery."
  />
)

const ORBIT = ['Your app', 'UGLYCASH', 'Your card', 'Your wallet']

// Apps orbit one eUSD core: many fintechs can run on the same dollar (different from the hero's inflow).
const EusdOrbit = () => (
  <div className="relative mx-auto h-[220px] w-[220px]" aria-hidden="true">
    <style>{`
      @keyframes hp-orbit { to { transform: rotate(360deg); } }
      @keyframes hp-orbit-counter { to { transform: rotate(-360deg); } }
      @keyframes hp-ring { 0% { transform: scale(0.6); opacity: 0.5; } 100% { transform: scale(1.6); opacity: 0; } }
      .hp-orbit { animation: hp-orbit 22s linear infinite; }
      .hp-orbit-label { animation: hp-orbit-counter 22s linear infinite; }
      .hp-ring { animation: hp-ring 3s ease-out infinite; }
      @media (prefers-reduced-motion: reduce) { .hp-orbit, .hp-orbit-label, .hp-ring { animation: none; } }
    `}</style>
    <span className="hp-ring absolute inset-[70px] rounded-full border-2 border-white/50" />
    <span
      className="hp-ring absolute inset-[70px] rounded-full border-2 border-white/40"
      style={{ animationDelay: '1.5s' }}
    />
    <span className="absolute inset-[10px] rounded-full border border-dashed border-white/30" />
    <div className="hp-orbit absolute inset-0">
      {ORBIT.map((label, i) => {
        const angle = (i / ORBIT.length) * 2 * Math.PI
        const x = 110 + 100 * Math.cos(angle)
        const y = 110 + 100 * Math.sin(angle)
        return (
          <span
            key={label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
          >
            <span
              className={cn(
                'hp-orbit-label block whitespace-nowrap rounded-full px-3 py-1 text-xs shadow-[0_8px_20px_rgba(0,0,0,0.15)]',
                label === 'UGLYCASH'
                  ? 'bg-foreground text-background'
                  : 'bg-card text-primary'
              )}
            >
              {label}
            </span>
          </span>
        )
      })}
    </div>
    <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <img src="/svgs/eusd.svg" alt="" className="h-12 w-12" />
    </div>
  </div>
)

export const FintechCardV18 = () => (
  <a
    href="mailto:partners@reserve.org"
    className="group relative flex min-h-[460px] w-full flex-col justify-between overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground"
  >
    <div className="pt-4">
      <EusdOrbit />
    </div>
    <div className="relative flex flex-col gap-3">
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
