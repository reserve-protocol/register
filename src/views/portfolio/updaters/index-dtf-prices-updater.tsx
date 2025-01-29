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

const IndexDTFPricesUpdater = () => {
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
    indexTokens.map((token) => token.address)
  )

  const { data: assetPrices } = useAssetPrices(assetAddresses)

  useEffect(() => {
    const newPrices: Record<Address, number> = {}
    dtfPrices?.forEach((dtf) => (newPrices[dtf.address] = dtf.price))
    assetPrices?.forEach((asset) => (newPrices[asset.address] = asset.price))
    setTokenPrices(newPrices)
  }, [dtfPrices, assetPrices, indexTokens, stakingTokens])

  return null
}

export default IndexDTFPricesUpdater
