import { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'

const ZapInputUSD = () => {
  const { amountIn, tokenInPrice } = useZap()

  const amountUSD = useMemo(() => {
    if (!tokenInPrice) return undefined
    return formatCurrency(Number(amountIn) * tokenInPrice, 2)
  }, [tokenInPrice, amountIn])

  if (!amountUSD) return <Skeleton width={100} height={20} />

  return <Text>${amountUSD}</Text>
}

export default ZapInputUSD
