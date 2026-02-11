import TokenLogo from 'components/icons/TokenLogo'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'

const ZapOutputBalance = () => {
  const { tokenOut, operation } = useZap()

  return (
    <div className="flex items-center gap-1">
      {operation === 'mint' && <TokenLogo symbol={tokenOut.symbol} />}
      <div>
        <span>Balance </span>
        {tokenOut.balance && (
          <span className="font-bold">
            {formatCurrency(+tokenOut.balance, 2, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </span>
        )}
      </div>
    </div>
  )
}

export default ZapOutputBalance
