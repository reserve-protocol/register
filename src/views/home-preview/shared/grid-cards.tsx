import { cn } from '@/lib/utils'
import {
  FEATURE_CARD_ASSET_TICKER_CLASS_NAME,
  FEATURE_CARD_CLASS_NAME,
  FEATURE_CARD_HEADER_CLASS_NAME,
  FEATURE_CARD_MEDIA_CLASS_NAME,
} from '@/views/home/components/highlighted-dtfs/constants'
import { ArrowRight, Play } from 'lucide-react'
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
  SERIES,
  weekly,
} from '../mock/ugly-cash-series'
import ActiveMap from './active-map'
import { CATEGORY_COLORS } from './category-colors'
import { countCompact, shortDate, usd, usdCompact } from './format'
import ModernArea from './modern-area'
import { BalanceGlassTooltip, glassClass } from './modern-bits'
import { UglyCashLogo } from './page-bits'

const growth30 = HEADLINE.volume30d / HEADLINE.volume30dPrev - 1
const pct = (v: number) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`

type TickerItem = { label: string; value?: string; color?: string }

const Ticker = ({
  items,
  marquee = false,
}: {
  items: TickerItem[]
  marquee?: boolean
}) => (
  <div className={FEATURE_CARD_ASSET_TICKER_CLASS_NAME}>
    <style>{`
      @keyframes hp-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      .hp-ticker-run { animation: hp-ticker 40s linear infinite; }
      @media (prefers-reduced-motion: reduce) { .hp-ticker-run { animation: none; } }
    `}</style>
    <div
      className={cn(
        'flex w-max items-center gap-4 whitespace-nowrap pl-4 text-sm',
        marquee && 'hp-ticker-run'
      )}
    >
      {(marquee ? [...items, ...items] : items).map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          {item.color && (
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: item.color }}
              aria-hidden="true"
            />
          )}
          <span className="font-medium">{item.label}</span>
          {item.value && <span className="text-legend">{item.value}</span>}
        </span>
      ))}
    </div>
  </div>
)

export const FeatureShell = ({
  icon,
  title,
  value,
  change,
  media,
  ticker,
  description,
  action,
  className,
  mediaClassName,
}: {
  icon?: React.ReactNode
  title: string
  value?: string
  change?: string
  media: React.ReactNode
  ticker?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
  mediaClassName?: string
}) => (
  <article className={cn(FEATURE_CARD_CLASS_NAME, className)}>
    <div className={FEATURE_CARD_MEDIA_CLASS_NAME}>
      <div className={FEATURE_CARD_HEADER_CLASS_NAME}>
        {icon}
        <h2 className="mt-3 text-xl leading-tight">{title}</h2>
        {value && (
          <p className="flex flex-wrap items-baseline gap-x-3 text-lg">
            <span className="tabular-nums">{value}</span>
            {change && (
              <span
                className={cn(
                  'tabular-nums',
                  /^[+-]/.test(change) ? 'text-success' : 'text-legend'
                )}
              >
                {change}
              </span>
            )}
          </p>
        )}
      </div>
      <div className={cn('relative h-[180px]', mediaClassName)}>{media}</div>
    </div>
    {ticker}
    {(description || action) && (
      <div className="flex flex-col gap-2 px-4 pb-4 pt-2 text-sm">
        {description && <p className="text-legend">{description}</p>}
        {action}
      </div>
    )}
  </article>
)

const EusdIcon = () => (
  <img src="/svgs/eusd.svg" alt="" aria-hidden="true" className="h-8 w-8" />
)

export const HeldCard = ({ wide = false }: { wide?: boolean }) => (
  <FeatureShell
    className={wide ? 'md:col-span-2' : undefined}
    mediaClassName={wide ? 'h-[260px]' : undefined}
    icon={<EusdIcon />}
    title="eUSD held in UGLYCASH"
    value={usd(HEADLINE.balance)}
    change={`${usdCompact(HEADLINE.balanceStart)} at launch`}
    media={
      <ModernArea
        data={SERIES}
        dataKey="texturedBalance"
        curve="linear"
        strokeWidth={2}
        tooltip={<BalanceGlassTooltip field="texturedBalance" />}
      />
    }
    ticker={
      <Ticker
        items={[
          { label: `${HEADLINE.daysLive} days`, value: 'live' },
          {
            label: countCompact(HEADLINE.cumulativeCount, 2),
            value: 'transactions',
          },
          {
            label: usdCompact(HEADLINE.cumulativeVolume),
            value: 'moved since launch',
          },
        ]}
      />
    }
    description="Every dollar people keep in UGLYCASH is eUSD, the stablecoin built on Reserve."
  />
)

const categoryTicker = (metric: 'volume' | 'count') => {
  const last30 = SERIES.slice(-30)
  return CATEGORIES.map((c) => {
    const v = last30.reduce((a, p) => a + p[metric][c.key], 0)
    return {
      label: c.label,
      value: metric === 'volume' ? usdCompact(v) : countCompact(v),
      color: CATEGORY_COLORS[c.key],
    }
  })
}

export const MovedCard = () => {
  const weeks = useMemo(() => weekly(SERIES), [])
  return (
    <FeatureShell
      icon={<EusdIcon />}
      title="eUSD moved, last 30 days"
      value={usd(HEADLINE.volume30d)}
      change={pct(growth30)}
      media={
        <ModernArea
          data={weeks}
          dataKey="totalVolume"
          curve="linear"
          strokeWidth={2}
        />
      }
      ticker={<Ticker items={categoryTicker('volume')} />}
      description="Deposits, withdrawals, sends and card spends, added up every day."
    />
  )
}

export const TransactionsCard = () => {
  const weeks = useMemo(() => weekly(SERIES), [])
  return (
    <FeatureShell
      icon={<EusdIcon />}
      title="Transactions, last 30 days"
      value={HEADLINE.count30d.toLocaleString('en-US')}
      change={`${countCompact(HEADLINE.cumulativeCount, 2)} since launch`}
      media={
        <ModernArea
          data={weeks}
          dataKey="totalCount"
          curve="linear"
          strokeWidth={2}
        />
      }
      ticker={<Ticker items={categoryTicker('count')} />}
      description="Each payment, transfer and card swipe that changes an eUSD balance."
    />
  )
}

const TypesTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: Record<string, number | string> }[]
}) => {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className={cn(glassClass, 'min-w-[200px] px-3 py-2 text-sm')}>
      <p className="mb-1">Week of {shortDate(String(row.date))}</p>
      {[...CATEGORIES].reverse().map((c) => (
        <div key={c.key} className="flex justify-between gap-4">
          <span className="text-legend">{c.label}</span>
          <span className="tabular-nums">{usdCompact(Number(row[c.key]))}</span>
        </div>
      ))}
    </div>
  )
}

export const TypesCard = () => {
  const rows = useMemo(
    () =>
      weekly(SERIES)
        .slice(-26)
        .map((w) => ({ date: w.date, ...w.volume })),
    []
  )
  return (
    <FeatureShell
      title="eUSD volume by type"
      value="Last 6 months, weekly"
      media={
        <div className="h-full px-4 pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
              barCategoryGap="18%"
            >
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                content={<TypesTooltip />}
                cursor={{ fill: 'hsl(var(--primary))', fillOpacity: 0.06 }}
                wrapperStyle={{ zIndex: 1000 }}
              />
              {CATEGORIES.map((c) => (
                <Bar
                  key={c.key}
                  dataKey={c.key}
                  stackId="t"
                  fill={CATEGORY_COLORS[c.key]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      }
      ticker={
        <Ticker
          items={categoryTicker('volume').map(({ label, color }) => ({
            label,
            color,
          }))}
        />
      }
      description="Hover a week to see how its volume splits across types."
    />
  )
}

export const CountriesCard = () => (
  <FeatureShell
    title={`Live in ${GLOBAL_COUNTRY_COUNT} countries`}
    value="Americas · Africa · Asia · Middle East · Oceania"
    media={
      <div className="flex h-full items-center justify-center px-3">
        <ActiveMap dataset="global" crop="world" className="max-h-full" />
      </div>
    }
    ticker={
      <Ticker
        marquee
        items={Object.values(GLOBAL_COUNTRIES)
          .flat()
          .map((label) => ({ label }))}
      />
    }
    description="Where people can open an UGLYCASH account today."
  />
)

export const PaydayCard = () => {
  const months = useMemo(() => {
    const recent = SERIES.slice(-182)
    const byMonth = new Map<string, number[]>()
    for (const p of recent) {
      const key = p.date.slice(0, 7)
      if (!byMonth.has(key)) byMonth.set(key, Array(31).fill(-1))
      byMonth.get(key)![Number(p.date.slice(8, 10)) - 1] = p.totalVolume
    }
    return [...byMonth.entries()].map(([key, cells]) => ({
      key,
      cells,
      max: Math.max(...cells),
    }))
  }, [])
  return (
    <FeatureShell
      title="Payday, twice a month"
      value="Daily volume, last 6 months"
      media={
        <div
          className="flex h-full flex-col justify-center gap-[3px] px-5"
          role="img"
          aria-label="Daily eUSD volume for the last six months, with peaks on the 1st and 15th"
        >
          {months.map((m) => (
            <div
              key={m.key}
              className="grid grid-cols-[repeat(31,minmax(0,1fr))] gap-[3px]"
            >
              {m.cells.map((v, d) => (
                <span
                  key={d}
                  className="h-[18px] rounded-[3px]"
                  style={{
                    background:
                      v < 0
                        ? 'transparent'
                        : `hsl(212 99% 35% / ${0.1 + 0.9 * Math.pow(v / m.max, 2)})`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      }
      ticker={
        <Ticker
          items={[
            { label: '1st', value: 'and' },
            { label: '15th', value: 'of every month' },
            { label: 'Deposits', value: 'jump when people get paid' },
          ]}
        />
      }
      description="One row per month. Deposits jump when salaries land, then flow out as people spend and send."
    />
  )
}

export const UglyCashCard = ({ onVideo }: { onVideo?: () => void }) => (
  <FeatureShell
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
    ticker={
      <Ticker
        items={[
          { label: 'Visa card' },
          { label: 'Dollar account' },
          { label: 'Global transfers' },
          { label: 'Savings' },
        ]}
      />
    }
    description="A dollar account and Visa card for people around the world. UGLYCASH is the car. eUSD is the battery."
    action={
      <button
        type="button"
        onClick={onVideo}
        className="flex items-center gap-2 self-start text-legend transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Play size={14} aria-hidden="true" />
        Watch video
      </button>
    }
  />
)

export const FintechEndCard = ({
  fullWidth = true,
}: {
  fullWidth?: boolean
}) => (
  <a
    href="mailto:partners@reserve.org"
    className={cn(
      'group flex h-full w-full rounded-3xl border-[4px] border-card bg-secondary transition-shadow',
      'min-h-[260px] hover:bg-card hover:shadow-sm md:min-h-[320px]',
      fullWidth && 'md:col-span-2'
    )}
  >
    <div className="flex h-full w-full flex-col justify-between rounded-2xl bg-secondary p-5 text-left group-hover:bg-card">
      <div className="flex items-start justify-between gap-4">
        <img
          src="/svgs/eusd.svg"
          alt=""
          aria-hidden="true"
          className="h-10 w-10"
        />
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-card bg-card text-primary transition-[background-color,color] group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowRight size={18} />
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-2xl text-primary">Building a fintech?</p>
        <p className="max-w-[44ch] text-legend">
          Run eUSD under your own app, the way UGLYCASH does. You can do it
          yourself, or we can help you launch.
        </p>
      </div>
    </div>
  </a>
)
