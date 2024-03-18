import { useMemo } from 'react'
import { Text, TextProps } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'

const ZapRate = (props: TextProps) => {
  const { rTokenSymbol, rTokenPrice, selectedToken, tokenInPrice } = useZap()

  const rate = useMemo(
    () => (rTokenPrice && tokenInPrice ? rTokenPrice / tokenInPrice : 0),
    [rTokenPrice, tokenInPrice]
  )

  const empty = useMemo(
    () => !selectedToken?.symbol || !rTokenSymbol,
    [selectedToken?.symbol, rTokenSymbol, rate]
  )

  if (empty) return null

  return (
    <Text {...props}>
      1 {selectedToken?.symbol} = {formatCurrency(+rate, 5)} {rTokenSymbol}
    </Text>
  )
}

export default ZapRate
