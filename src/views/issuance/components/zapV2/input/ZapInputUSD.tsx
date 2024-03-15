import { useChainlinkPrice } from 'hooks/useChainlinkPrice'
import { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { Address } from 'viem'
import { useZap } from '../context/ZapContext'

const ZapInputUSD = () => {
  const { amountIn, selectedToken } = useZap()

  const price = useChainlinkPrice(selectedToken?.address as Address | undefined)

  const amountUSD = useMemo(() => {
    if (!price) return undefined
    return formatCurrency(Number(amountIn) * price, 2)
  }, [price, amountIn])

  if (!amountUSD) return <Skeleton width={100} height={20} />

  return <Text>${amountUSD}</Text>
}

export default ZapInputUSD
