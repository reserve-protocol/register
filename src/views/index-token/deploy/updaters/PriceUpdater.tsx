import { useChainlinkPrices } from '@/hooks/useChainlinkPrices'
import { tokenListAtom, tokenPricesAtom } from '../atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

// TODO: Most likely going away
const PriceUpdater = () => {
  const allTokens = useAtomValue(tokenListAtom)
  const setTokenPrices = useSetAtom(tokenPricesAtom)

  // TODO: replace with real data
  const prices = useChainlinkPrices(
    1,
    allTokens.map((token) => token.address)
  )

  useEffect(() => {
    allTokens.forEach(({ address }, index) => {
      setTokenPrices((prev) => ({
        ...prev,
        [address]: prices?.[index] ?? 0,
      }))
    })
  }, [prices, setTokenPrices])

  return null
}

export default PriceUpdater
