import { Button } from '@/components/ui/button'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'
import TokenLogo from 'components/icons/TokenLogo'
import { useMemo } from 'react'

const ZapInputMaxButton = () => {
  const { operation, tokenIn, onClickMax } = useZap()

  const decimalsFormat = useMemo(() => {
    const balance = +(tokenIn.balance ?? 0)
    return balance > 0 && balance < 1 ? 4 : 2
  }, [tokenIn.balance])

  return (
    <div className="flex items-center gap-1">
      {operation === 'redeem' && <TokenLogo symbol={tokenIn.symbol} />}
      <div className="flex items-center gap-2">
        <div>
          <span>Balance </span>
          <span className="font-bold">
            {formatCurrency(+(tokenIn.balance ?? '0'), decimalsFormat, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="rounded"
          onClick={onClickMax}
        >
          Max
        </Button>
      </div>
    </div>
  )
}

export default ZapInputMaxButton
