import { cn } from '@/lib/utils'
import { DayPoint } from '../mock/ugly-cash-series'
import { countCompact, shortDate, usd } from './format'

// The current home's card surface: sand fading into card.
export const GradientCard = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-3xl bg-gradient-to-b from-secondary/80 to-card transition-colors duration-200 hover:from-card',
      className
    )}
  >
    {children}
  </div>
)

export const glassClass =
  'rounded-2xl border-2 border-card bg-card/60 shadow-[0_20px_70px_rgba(0,0,0,0.1)] backdrop-blur-md'

export const StageFrame = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={cn('lg:mx-2 2xl:mx-0', className)}>
    <div className="overflow-hidden border-[4px] border-secondary bg-secondary lg:rounded-4xl">
      {children}
    </div>
  </div>
)

export const BalanceGlassTooltip = ({
  active,
  payload,
  field = 'balance',
}: {
  active?: boolean
  payload?: { payload: DayPoint }[]
  field?: 'balance' | 'texturedBalance'
}) => {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className={cn(glassClass, 'hidden min-w-[240px] flex-col md:flex')}>
      <div className="border-b border-border px-4 py-3 text-sm">
        {shortDate(p.date)}
      </div>
      <div className="flex flex-col gap-1 px-4 py-3 text-sm">
        <div className="flex justify-between gap-6">
          <span className="text-legend">eUSD held</span>
          <span className="font-semibold text-primary tabular-nums">
            {usd(p[field])}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-legend">Moved that day</span>
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
  )
}
