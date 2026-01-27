import { useMemo } from 'react'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'

interface Props {
  className?: string
}

const ZapRate = ({ className }: Props) => {
  const { tokenIn, tokenOut } = useZap()

  const rate = useMemo(
    () =>
      tokenIn.price && tokenOut.price ? tokenIn.price / tokenOut.price : 0,
    [tokenIn.price, tokenOut.price]
  )

  return (
    <span className={className}>
      1 {tokenIn.symbol} = {formatCurrency(rate, 5)} {tokenOut.symbol}
    </span>
  )
}

export default ZapRate
