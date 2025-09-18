import { useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { indexDTFBasketAtom, indexDTFBasketSharesAtom } from '@/state/dtf/atoms'
import { chainIdAtom } from '@/state/atoms'
import { getNativeToken } from '@/utils/token-mappings'
import { enrichNativeTokensWithMarketData } from '@/utils/market-data'

interface MarketDataUpdaterProps {
  isExposure: boolean
}

const MarketDataUpdater = ({ isExposure }: MarketDataUpdaterProps) => {
  const basket = useAtomValue(indexDTFBasketAtom)
  const basketShares = useAtomValue(indexDTFBasketSharesAtom)
  const chainId = useAtomValue(chainIdAtom)

  useEffect(() => {
    if (!isExposure || !basket) return

    // Get unique native tokens from basket
    const nativeKeys = new Set<string>()

    for (const token of basket) {
      if (basketShares[token.address] === '0.00') continue

      const nativeInfo = getNativeToken(chainId, token.address)
      if (nativeInfo) {
        nativeKeys.add(nativeInfo.mapping.nativeKey)
      }
    }

    if (nativeKeys.size > 0) {
      // Fetch market data for native tokens
      enrichNativeTokensWithMarketData(Array.from(nativeKeys))
    }
  }, [isExposure, basket, basketShares, chainId])

  return null
}

export default MarketDataUpdater