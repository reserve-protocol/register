import {
  formatCurrency,
  formatPercentage,
  formatToSignificantDigits,
} from '@/utils'
import dayjs from 'dayjs'
import { TooltipProps } from 'recharts'
import { DataType } from './price-chart-constants'

export function PriceTooltip({
  payload,
  active,
  dataType,
}: {
  payload?: TooltipProps<number, string>['payload']
  active?: boolean
  dataType: DataType
}) {
  if (!active || !payload) return null

  const subtitle = dayjs
    .unix(+payload[0]?.payload?.timestamp)
    .format('YYYY-M-D HH:mm')
  const value = payload[0]?.payload?.[dataType]
  const isBTC = dataType === 'priceBTC'
  const formattedValue =
    dataType === 'price' || isBTC
      ? formatToSignificantDigits(value)
      : formatCurrency(value, 2)
  const prefix = isBTC ? '₿' : '$'

  return (
    <div className="bg-card text-card-foreground rounded-[20px] p-4">
      <span className="text-base font-medium block mb-1">
        {prefix}
        {formattedValue}
      </span>
      <span className="text-sm text-muted-foreground">{subtitle}</span>
    </div>
  )
}

export function YieldTooltip({
  payload,
  active,
}: {
  payload?: TooltipProps<number, string>['payload']
  active?: boolean
}) {
  if (!active || !payload) return null

  const d = payload[0]?.payload
  const subtitle = dayjs.unix(+d?.timestamp).format('YYYY-M-D HH:mm')

  return (
    <div className="bg-card text-card-foreground rounded-[20px] p-4">
      <span className="text-base font-medium block mb-1">
        {formatPercentage(d?.totalAPY)} Total APY
      </span>
      <div className="text-sm text-muted-foreground space-y-0.5 mb-1">
        <div>{formatPercentage(d?.collateralAPY)} Base APY</div>
        <div>{formatPercentage(d?.redirectAPY)} Revenue Boost</div>
      </div>
      <span className="text-sm text-muted-foreground">{subtitle}</span>
    </div>
  )
}
