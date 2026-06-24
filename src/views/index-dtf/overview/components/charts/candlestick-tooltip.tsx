import { formatToSignificantDigits } from '@/utils'
import { Trans } from '@lingui/react/macro'
import dayjs from 'dayjs'
import { TooltipProps } from 'recharts'
import { ChartCandle } from './use-candlestick-data'

const Row = ({ label, value }: { label: React.ReactNode; value: number }) => (
  <div className="flex items-center justify-between gap-6">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium tabular-nums">
      ${formatToSignificantDigits(value)}
    </span>
  </div>
)

export function CandlestickTooltip({
  payload,
  active,
}: {
  payload?: TooltipProps<number, string>['payload']
  active?: boolean
}) {
  if (!active || !payload?.length) return null

  const candle = payload[0]?.payload as ChartCandle | undefined
  if (!candle) return null

  const subtitle = dayjs.unix(candle.timestamp).format('YYYY-M-D HH:mm')

  return (
    <div className="bg-card text-card-foreground rounded-[20px] p-4 text-sm">
      <div className="space-y-0.5 mb-1">
        <Row label={<Trans>Open</Trans>} value={candle.open} />
        <Row label={<Trans>High</Trans>} value={candle.high} />
        <Row label={<Trans>Low</Trans>} value={candle.low} />
        <Row label={<Trans>Close</Trans>} value={candle.close} />
      </div>
      <span className="text-muted-foreground">{subtitle}</span>
    </div>
  )
}
