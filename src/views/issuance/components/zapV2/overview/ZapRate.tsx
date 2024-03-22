import { useMemo } from 'react'
import { Text, TextProps } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'

const ZapRate = (props: TextProps) => {
  const { tokenIn, tokenOut } = useZap()

  const rate = useMemo(
    () =>
      tokenIn.price && tokenOut.price ? tokenIn.price / tokenOut.price : 0,
    [tokenIn.price, tokenOut.price]
  )

  return (
    <Text {...props}>
      1 {tokenIn.symbol} = {formatCurrency(rate, 5)} {tokenOut.symbol}
    </Text>
  )
}

export default ZapRate
