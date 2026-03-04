import { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'

const ZapInputUSD = () => {
  const { amountIn, tokenIn } = useZap()

  const amountUSD = useMemo(() => {
    if (!tokenIn.price) return undefined
    return formatCurrency(Number(amountIn) * tokenIn.price, 2)
  }, [tokenIn, amountIn])

  if (!amountUSD) return <Skeleton width={100} height={20} />

  return <span>${amountUSD}</span>
}

export default ZapInputUSD
