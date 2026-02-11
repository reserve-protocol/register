import { cn } from '@/lib/utils'
import Skeleton from 'react-loading-skeleton'
import { PRICE_IMPACT_THRESHOLD } from '../constants'
import { useZap } from '../context/ZapContext'
import { formatNumber, formatSlippage } from '../utils'
import ZapGasCost from './ZapGasCost'
import ZapRate from './ZapRate'

interface Props {
  hideGasCost?: boolean
  className?: string
}

const ZapDetails = ({ hideGasCost, className }: Props) => {
  const { priceImpact, slippage, loadingZap, minAmountOut, tokenOut } = useZap()

  return (
    <div className={cn('flex flex-col gap-2 mb-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm">Price Impact</span>
        {loadingZap ? (
          <Skeleton width={36} height={10} />
        ) : (
          <span
            className={cn(
              'text-sm font-medium',
              (priceImpact || 0) > PRICE_IMPACT_THRESHOLD
                ? 'text-destructive'
                : 'text-foreground'
            )}
          >
            {formatNumber(priceImpact || 0, 2)}%
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Max. slippage</span>
        <span className="text-sm font-medium">{formatSlippage(slippage)}</span>
      </div>
      {minAmountOut && (
        <div className="flex items-center justify-between">
          <span className="text-sm">Min. amount out</span>
          <span className="text-sm font-medium">
            {minAmountOut} {tokenOut?.symbol}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm">Rate</span>
        <ZapRate className="text-sm font-medium" />
      </div>
      {!hideGasCost && <ZapGasCost />}
    </div>
  )
}

export default ZapDetails
