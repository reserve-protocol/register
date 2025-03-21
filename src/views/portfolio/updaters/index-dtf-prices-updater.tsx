import { useAssetPrices, useDTFPrices } from '@/hooks/usePrices'
import { rsrPriceAtom } from '@/state/atoms'
import { RSR_ADDRESS } from '@/utils/addresses'
import { ChainId } from '@/utils/chains'
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
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const indexTokens = useAtomValue(accountIndexTokensAtom)
  const stakingTokens = useAtomValue(accountStakingTokensAtom)
  const unclaimedLocks = useAtomValue(accountUnclaimedLocksAtom)
  const setTokenPrices = useSetAtom(accountTokenPricesAtom)

  const mainnetAssetAddresses = [
    ...new Set([
      ...stakingTokens
        .filter(({ chainId }) => chainId === ChainId.Mainnet)
        .map((token) => token.underlying.address),
      ...unclaimedLocks
        .filter(({ chainId }) => chainId === ChainId.Mainnet)
        .map((token) => token.underlying.address),
    ]),
  ]

  const baseAssetAddresses = [
    ...new Set([
      ...stakingTokens
        .filter(({ chainId }) => chainId === ChainId.Base)
        .map((token) => token.underlying.address),
      ...unclaimedLocks
        .filter(({ chainId }) => chainId === ChainId.Base)
        .map((token) => token.underlying.address),
    ]),
  ]

  const { data: mainnetDTFPrices } = useDTFPrices(
    indexTokens
      .filter(({ chainId }) => chainId === ChainId.Mainnet)
      .map((token) => token.address),
    ChainId.Mainnet
  )

  const { data: baseDTFPrices } = useDTFPrices(
    indexTokens
      .filter(({ chainId }) => chainId === ChainId.Base)
      .map((token) => token.address),
    ChainId.Base
  )

  const { data: mainnetAssetPrices } = useAssetPrices(
    mainnetAssetAddresses,
    ChainId.Mainnet
  )
  const { data: baseAssetPrices } = useAssetPrices(
    baseAssetAddresses,
    ChainId.Base
  )

  useEffect(() => {
    const finalPrices: Record<Address, number> = {
      [RSR_ADDRESS[ChainId.Mainnet]]: rsrPrice,
      [RSR_ADDRESS[ChainId.Base]]: rsrPrice,
    }

    mainnetDTFPrices?.forEach((dtf) => (finalPrices[dtf.address] = dtf.price))
    baseDTFPrices?.forEach((dtf) => (finalPrices[dtf.address] = dtf.price))
    mainnetAssetPrices?.forEach(
      (asset) => (finalPrices[asset.address] = asset.price)
    )
    baseAssetPrices?.forEach(
      (asset) => (finalPrices[asset.address] = asset.price)
    )

    setTokenPrices(finalPrices)
  }, [
    mainnetDTFPrices,
    baseDTFPrices,
    mainnetAssetPrices,
    baseAssetPrices,
    indexTokens,
    stakingTokens,
    rsrPrice,
  ])

  return null
}

export default IndexDTFPricesUpdater
