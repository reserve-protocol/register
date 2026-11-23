import { getTokenRoute } from '@/utils'
import { EUSD_ADDRESS } from '@/utils/addresses'
import { ChainId } from '@/utils/chains'
import { Trans, useLingui } from '@lingui/react/macro'
import { useMemo, useRef } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Category } from '../data/categories'
import { useReducedMotion } from '../hooks/use-reduced-motion'
import { MonthPoint, useUglycashMetrics } from '../hooks/use-uglycash-metrics'
import { countCompact, monthName, usd, usdCompact } from '../utils'
import { BalanceTip, MonthTip } from './chart-tooltips'
import DottedAreaChart from './dotted-area-chart'
import { AutoTicker, HomeCard } from './home-card'

const EUSD_ROUTE = getTokenRoute(EUSD_ADDRESS[ChainId.Mainnet], ChainId.Mainnet)

const EusdIcon = () => (
  <img src="/svgs/eusd.svg" alt="" aria-hidden="true" className="h-8 w-8" />
)

const DataCardError = ({ title }: { title: string }) => (
  <HomeCard
    icon={<EusdIcon />}
    title={title}
    media={
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-legend">
        <Trans>
          UGLYCASH metrics could not be loaded. The rest of the page still
          works.
        </Trans>
      </div>
    }
  />
)

const rankByLatest = (
  categories: Category[],
  latest: MonthPoint,
  metric: 'volume' | 'count'
) =>
  [...categories].sort(
    (a, b) => latest[metric][b.key] - latest[metric][a.key]
  )

export const HeldCard = () => {
  const { t } = useLingui()
  const anchor = useRef<HTMLDivElement>(null)
  const { data, isError } = useUglycashMetrics()
  const title = t`eUSD held in UGLYCASH`
  if (isError && !data) return <DataCardError title={title} />

  const days = data?.headline.daysLive
  return (
    <HomeCard
      revealed={!!data}
      href={EUSD_ROUTE}
      cta="eusd_held"
      icon={<EusdIcon />}
      title={title}
      value={data && usd(data.headline.balance)}
      media={
        data && (
          <div ref={anchor} className="h-full">
            <DottedAreaChart
              data={data.daily}
              xKey="date"
              dataKey="balance"
              tooltip={<BalanceTip anchor={anchor} />}
            />
          </div>
        )
      }
      ticker={
        data && (
          <AutoTicker
            items={[
              { key: 'days', label: t`${days} days`, value: t`live` },
              {
                key: 'transactions',
                label: countCompact(data.headline.cumulativeCount, 2),
                value: t`transactions`,
              },
              {
                key: 'volume',
                label: usdCompact(data.headline.cumulativeVolume),
                value: t`volume since launch`,
              },
              {
                key: 'held',
                label: usdCompact(data.headline.balance),
                value: t`held today`,
              },
            ]}
          />
        )
      }
      description={
        <Trans>
          eUSD in UGLYCASH's wallets onchain, the stablecoin built on Reserve.
        </Trans>
      }
    />
  )
}

export const VolumeCard = () => {
  const { t, i18n } = useLingui()
  const anchor = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { data, isError } = useUglycashMetrics()
  const rows = useMemo(
    () => data?.monthly.map((month) => ({ ...month, ...month.volume })),
    [data]
  )
  const title = t`eUSD volume in UGLYCASH`
  if (isError && !data) return <DataCardError title={title} />

  const categories = data?.categories.volume ?? []
  const latest = data?.monthly[data.monthly.length - 1]
  const amount = latest && usd(latest.totalVolume)
  const month = latest && monthName(latest.month, i18n.locale)
  const total = data && usdCompact(data.headline.cumulativeVolume)
  return (
    <HomeCard
      revealed={!!data}
      icon={<EusdIcon />}
      title={title}
      value={latest && t`${amount} in ${month}`}
      media={
        latest && (
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
                      categories={rankByLatest(categories, latest, 'volume')}
                    />
                  }
                  cursor={{ fill: 'hsl(var(--primary))', fillOpacity: 0.06 }}
                />
                {categories.map((category, i) => (
                  <Bar
                    key={category.key}
                    dataKey={category.key}
                    stackId="month"
                    fill={category.color}
                    radius={i === categories.length - 1 ? [3, 3, 0, 0] : 0}
                    isAnimationActive={!reduced}
                    animationDuration={800}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      }
      ticker={
        latest && (
          <AutoTicker
            items={categories.map((category) => ({
              key: category.key,
              label: t(category.label),
              value: usdCompact(latest.volume[category.key]),
              color: category.color,
            }))}
          />
        )
      }
      description={t`Monthly volume since launch: ${total} so far. Hover a month for the split by type.`}
    />
  )
}

export const TransactionsCard = () => {
  const { t, i18n } = useLingui()
  const anchor = useRef<HTMLDivElement>(null)
  const { data, isError } = useUglycashMetrics()
  const title = t`eUSD transactions in UGLYCASH`
  if (isError && !data) return <DataCardError title={title} />

  const categories = data?.categories.count ?? []
  const latest = data?.monthly[data.monthly.length - 1]
  const count = latest?.totalCount.toLocaleString('en-US')
  const month = latest && monthName(latest.month, i18n.locale)
  const total = data && countCompact(data.headline.cumulativeCount, 2)
  return (
    <HomeCard
      revealed={!!data}
      icon={<EusdIcon />}
      title={title}
      value={latest && t`${count} in ${month}`}
      media={
        data &&
        latest && (
          <div ref={anchor} className="h-full">
            <DottedAreaChart
              data={data.monthly}
              xKey="month"
              dataKey="totalCount"
              tooltip={
                <MonthTip
                  anchor={anchor}
                  metric="count"
                  categories={rankByLatest(categories, latest, 'count')}
                />
              }
            />
          </div>
        )
      }
      ticker={
        latest && (
          <AutoTicker
            items={categories.map((category) => ({
              key: category.key,
              label: t(category.label),
              value: countCompact(latest.count[category.key]),
              color: category.color,
            }))}
          />
        )
      }
      description={t`Monthly transactions since launch: ${total} so far.`}
    />
  )
}
