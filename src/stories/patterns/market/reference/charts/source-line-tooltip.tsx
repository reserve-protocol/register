import dayjs from 'dayjs'
import type { TooltipProps } from 'recharts'
import { tooltipSurfaceRecipe } from '@/components/design-system-v1/tooltip-surface'
import { cn } from '@/lib/utils'
import { formatToSignificantDigits } from '@/utils'

type SourceLinePoint = {
  timestamp: number
  price: number
}

export function SourceLineTooltip({
  payload,
  active,
}: {
  payload?: TooltipProps<number, string>['payload']
  active?: boolean
}) {
  if (!active || !payload?.length) return null

  const point = payload[0]?.payload as Partial<SourceLinePoint> | undefined
  const timestampValue = point?.timestamp
  const price = point?.price
  if (
    typeof timestampValue !== 'number' ||
    typeof price !== 'number' ||
    !Number.isFinite(timestampValue) ||
    !Number.isFinite(price)
  ) {
    return null
  }

  const timestamp = dayjs.unix(timestampValue).format('YYYY-M-D HH:mm')

  return (
    <div
      data-testid="chart-line-source-tooltip"
      className={cn(
        tooltipSurfaceRecipe,
        'border bg-popover text-popover-foreground'
      )}
    >
      <p className="font-medium tabular-nums">
        ${formatToSignificantDigits(price)}
      </p>
      <time
        dateTime={new Date(timestampValue * 1000).toISOString()}
        title={dayjs.unix(timestampValue).format('YYYY-MM-DD HH:mm Z')}
        className="mt-1 block text-muted-foreground tabular-nums"
      >
        {timestamp}
      </time>
    </div>
  )
}
