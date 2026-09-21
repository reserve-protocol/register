import dayjs from 'dayjs'
import type { TooltipProps } from 'recharts'
import { tooltipSurfaceRecipe } from '@/components/design-system-v1/tooltip-surface'
import { cn } from '@/lib/utils'
import { formatToSignificantDigits } from '@/utils'
import type { ChartCandle } from '@/views/index-dtf/overview/components/charts/candlestick-data'

function TooltipRow({
  label,
  value,
}: {
  label: React.ReactNode
  value: number
}) {
  return (
    <div className="grid grid-cols-subgrid items-center col-span-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium tabular-nums">
        ${formatToSignificantDigits(value)}
      </span>
    </div>
  )
}

export function SourceCandlestickTooltip({
  payload,
  active,
}: {
  payload?: TooltipProps<number, string>['payload']
  active?: boolean
}) {
  if (!active || !payload?.length) return null

  const candle = payload[0]?.payload as ChartCandle | undefined
  if (!candle) return null

  const timestamp = dayjs.unix(candle.timestamp).format('YYYY-M-D HH:mm')

  return (
    <div
      data-testid="chart-candlestick-source-tooltip"
      className={cn(
        tooltipSurfaceRecipe,
        'grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 border bg-popover text-popover-foreground'
      )}
    >
      <time
        dateTime={new Date(candle.timestamp * 1000).toISOString()}
        title={dayjs.unix(candle.timestamp).format('YYYY-MM-DD HH:mm Z')}
        className="col-span-2 mb-2 block text-muted-foreground tabular-nums"
      >
        {timestamp}
      </time>
      <TooltipRow label={<>Open</>} value={candle.open} />
      <TooltipRow label={<>High</>} value={candle.high} />
      <TooltipRow label={<>Low</>} value={candle.low} />
      <TooltipRow label={<>Close</>} value={candle.close} />
    </div>
  )
}
