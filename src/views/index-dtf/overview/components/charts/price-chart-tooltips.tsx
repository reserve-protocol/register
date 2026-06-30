import {
  formatCurrency,
  formatPercentage,
  formatToSignificantDigits,
} from '@/utils'
import { Trans } from '@lingui/react/macro'
import dayjs from 'dayjs'
import { TooltipProps } from 'recharts'
import { DataType, MARKET_PRICE_STROKE } from './price-chart-constants'

export function PriceTooltip({
  payload,
  active,
  dataType,
  showMarketPrice = false,
}: {
  payload?: TooltipProps<number, string>['payload']
  active?: boolean
  dataType: DataType
  showMarketPrice?: boolean
}) {
  if (!active || !payload) return null

  const point = payload[0]?.payload
  const subtitle = dayjs.unix(+point?.timestamp).format('YYYY-M-D HH:mm')
  const value = point?.[dataType]
  const isBTC = dataType === 'priceBTC'
  const formattedValue =
    dataType === 'price' || isBTC
      ? formatToSignificantDigits(value)
      : formatCurrency(value, 2)
  const prefix = isBTC ? '₿' : '$'
  const marketPrice = point?.marketPrice
  const showMarketRow =
    showMarketPrice && typeof marketPrice === 'number' && marketPrice > 0

  return (
    <div className="bg-card text-card-foreground rounded-[20px] p-4">
      <span className="text-base font-medium block mb-1">
        {prefix}
        {formattedValue}
      </span>
      {showMarketRow && (
        <span className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
          <svg width="14" height="6" aria-hidden="true">
            <line
              x1="0"
              y1="3"
              x2="14"
              y2="3"
              stroke={MARKET_PRICE_STROKE}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>
          <Trans>Market</Trans> ${formatToSignificantDigits(marketPrice)}
        </span>
      )}
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
        {formatPercentage(d?.totalAPY)} <Trans>Total APY</Trans>
      </span>
      <div className="text-sm text-muted-foreground space-y-0.5 mb-1">
        <div>
          {formatPercentage(d?.collateralAPY)} <Trans>Base APY</Trans>
        </div>
        <div>
          {formatPercentage(d?.redirectAPY)} <Trans>Revenue Boost</Trans>
        </div>
      </div>
      <span className="text-sm text-muted-foreground">{subtitle}</span>
    </div>
  )
}
