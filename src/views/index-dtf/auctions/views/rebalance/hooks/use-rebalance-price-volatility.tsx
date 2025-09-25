import useAssetPriceVolatility from '@/hooks/use-asset-price-volatility'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { currentRebalanceAtom } from '../../../atoms'

const useRebalancePriceVolatility = () => {
  const rebalance = useAtomValue(currentRebalanceAtom)
  const assets = useMemo(() => {
    if (!rebalance) return []
    return rebalance.rebalance.tokens.map((token) =>
      token.address.toLowerCase()
    )
  }, [rebalance])

  return useAssetPriceVolatility(assets)
}

export default useRebalancePriceVolatility
