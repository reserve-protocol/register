import { cn } from '@/lib/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import type { RefObject } from 'react'
import { createPortal } from 'react-dom'
import type { Category } from '../data/categories'
import type { DayPoint, MonthPoint } from '../hooks/use-uglycash-metrics'
import { countCompact, monthYear, shortDate, usd } from '../utils'

const TOOLTIP_WIDTH = 260
const GLASS_CLASS_NAME =
  'rounded-2xl border-2 border-card bg-card/60 shadow-[0_20px_70px_rgba(0,0,0,0.1)] backdrop-blur-md'

type TipProps<T> = {
  active?: boolean
  coordinate?: { x: number; y: number }
  payload?: { payload: T }[]
  anchor: RefObject<HTMLElement | null>
}

// Cards clip their media, so tooltips render in a portal positioned over the page instead.
const PortalTip = ({
  active,
  coordinate,
  anchor,
  children,
}: Omit<TipProps<unknown>, 'payload'> & { children: React.ReactNode }) => {
  if (!active || !coordinate || !anchor.current) return null
  const rect = anchor.current.getBoundingClientRect()
  const x = rect.left + coordinate.x
  const flipped = x + 16 + TOOLTIP_WIDTH > window.innerWidth
  const left = Math.max(8, flipped ? x - TOOLTIP_WIDTH - 16 : x + 16)
  const top = Math.max(
    8,
    Math.min(rect.top + coordinate.y - 60, window.innerHeight - 280)
  )
  return createPortal(
    <div
      className="pointer-events-none fixed z-[1000]"
      style={{ left, top, width: TOOLTIP_WIDTH }}
    >
      {children}
    </div>,
    document.body
  )
}

const Row = ({
  label,
  children,
}: {
  label: React.ReactNode
  children: React.ReactNode
}) => (
  <div className="flex justify-between gap-6">
    <span className="flex items-center gap-2 text-legend">{label}</span>
    {children}
  </div>
)

export const MonthTip = ({
  metric,
  categories,
  ...props
}: TipProps<MonthPoint> & {
  metric: 'volume' | 'count'
  // Ranked once by the caller, so the rows keep the same order on every hover.
  categories: Category[]
}) => {
  const { t, i18n } = useLingui()
  const month = props.payload?.[0]?.payload
  const format = (value: number) =>
    metric === 'volume' ? usd(value) : value.toLocaleString('en-US')
  return (
    <PortalTip {...props}>
      {month && (
        <div className={cn(GLASS_CLASS_NAME, 'text-sm')}>
          <div className="border-b border-border px-4 py-3">
            {monthYear(month.month, i18n.locale)}
          </div>
          <div className="flex flex-col gap-1 px-4 py-3">
            {categories.map((category) => (
              <Row
                key={category.key}
                label={
                  <>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: category.color }}
                    />
                    {t(category.label)}
                  </>
                }
              >
                <span className="tabular-nums">
                  {format(month[metric][category.key])}
                </span>
              </Row>
            ))}
          </div>
          <div className="flex justify-between border-t border-border px-4 py-3 font-semibold">
            <span>
              <Trans>Total</Trans>
            </span>
            <span className="text-primary tabular-nums">
              {format(
                metric === 'volume' ? month.totalVolume : month.totalCount
              )}
            </span>
          </div>
        </div>
      )}
    </PortalTip>
  )
}

export const BalanceTip = (props: TipProps<DayPoint>) => {
  const { i18n } = useLingui()
  const day = props.payload?.[0]?.payload
  return (
    <PortalTip {...props}>
      {day && (
        <div className={cn(GLASS_CLASS_NAME, 'text-sm')}>
          <div className="border-b border-border px-4 py-3">
            {shortDate(day.date, i18n.locale)}
          </div>
          <div className="flex flex-col gap-1 px-4 py-3">
            <Row label={<Trans>eUSD held</Trans>}>
              <span className="font-semibold text-primary tabular-nums">
                {usd(day.balance)}
              </span>
            </Row>
            <Row label={<Trans>Volume that day</Trans>}>
              <span className="font-semibold tabular-nums">
                {usd(day.totalVolume)}
              </span>
            </Row>
            <Row label={<Trans>Transactions</Trans>}>
              <span className="font-semibold tabular-nums">
                {countCompact(day.totalCount)}
              </span>
            </Row>
          </div>
        </div>
      )}
    </PortalTip>
  )
}
