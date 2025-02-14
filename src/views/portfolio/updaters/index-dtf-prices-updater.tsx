import { useAssetPrices, useDTFPrices } from '@/hooks/usePrices'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Address } from 'viem'
import {
  accountIndexTokensAtom,
  accountStakingTokensAtom,
  accountTokenPricesAtom,
  accountUnclaimedLocksAtom,
} from '../atoms'
import { chainIdAtom, rsrPriceAtom } from '@/state/atoms'
import { RSR_ADDRESS } from '@/utils/addresses'

const IndexDTFPricesUpdater = () => {
  const chainId = useAtomValue(chainIdAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const indexTokens = useAtomValue(accountIndexTokensAtom)
  const stakingTokens = useAtomValue(accountStakingTokensAtom)
  const unclaimedLocks = useAtomValue(accountUnclaimedLocksAtom)
  const setTokenPrices = useSetAtom(accountTokenPricesAtom)

  const assetAddresses = [
    ...new Set([
      ...stakingTokens.map((token) => token.underlying.address),
      ...unclaimedLocks.map((token) => token.underlying.address),
    ]),
  ]

  const { data: dtfPrices } = useDTFPrices(
    indexTokens.map((token) => token.address),
    chainId
  )

  const { data: assetPrices } = useAssetPrices(assetAddresses, chainId)

  useEffect(() => {
    const newPrices: Record<Address, number> = {
      [RSR_ADDRESS[chainId]]: rsrPrice,
    }
    dtfPrices?.forEach((dtf) => (newPrices[dtf.address] = dtf.price))
    assetPrices?.forEach((asset) => (newPrices[asset.address] = asset.price))
    setTokenPrices(newPrices)
  }, [dtfPrices, assetPrices, indexTokens, stakingTokens, rsrPrice, chainId])

  return null
}

export default IndexDTFPricesUpdater
