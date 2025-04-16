import dtfIndexAbi from '@/abis/dtf-index-abi'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFBasketSharesAtom,
  iTokenAddressAtom,
} from '@/state/dtf/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { formatUnits, parseEther } from 'viem'
import { useReadContracts } from 'wagmi'
import {
  dtfSupplyAtom,
  dtfTradeDelay,
  IndexAssetShares,
  isDeferAvailableAtom,
  isProposalConfirmedAtom,
  permissionlessLaunchingAtom,
  priceMapAtom,
  proposedIndexBasketAtom,
  proposedSharesAtom,
  proposedUnitsAtom,
  stepAtom,
  tradeRangeOptionAtom,
  tradeVolatilityAtom,
} from './atoms'
import { PermissionOptionId } from './components/proposal-trading-expiration'

const PRICES_BASE_URL = `${RESERVE_API}current/prices?tokens=`

const tokensUrlAtom = atom((get) => {
  const chainId = get(chainIdAtom)
  const proposedIndexBasket = get(proposedIndexBasketAtom)
  const priceMap = get(priceMapAtom)

  if (!proposedIndexBasket) return undefined

  // const urls: string[] = []

  // STALE PRICES!!!
  // Only fetch prices for addresses not included on the price map
  const addresses = Object.keys(proposedIndexBasket).reduce((acc, address) => {
    if (!priceMap[address.toLowerCase()]) {
      acc.push(address)
    }
    return acc
  }, [] as string[])

  if (addresses.length === 0) return undefined

  return `${PRICES_BASE_URL}${addresses.join(',')}&chainId=${chainId}`
})

const BasketPriceUpdater = () => {
  const url = useAtomValue(tokensUrlAtom)
  const setPriceMap = useSetAtom(priceMapAtom)

  const { data: tokenPrices } = useQuery({
    queryKey: ['price-tokens', url],
    queryFn: async () => {
      if (!url) return undefined

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch token prices')
        }
        const data = (await response.json()) as {
          address: string
          price?: number
        }[]

        return data.reduce(
          (acc, token) => {
            acc[token.address] = token.price ?? 0
            return acc
          },
          {} as Record<string, number>
        )
      } catch (error) {
        console.error('Error fetching token prices:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    enabled: !!url,
  })

  useEffect(() => {
    if (tokenPrices) {
      setPriceMap((prev) => ({ ...prev, ...tokenPrices }))
    }
  }, [tokenPrices])

  return null
}

const useInitialBasket = ():
  | [bigint, Record<string, IndexAssetShares>, Record<string, number>, bigint]
  | undefined => {
  const dtfAddress = useAtomValue(iTokenAddressAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const shares = useAtomValue(indexDTFBasketSharesAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { data } = useReadContracts({
    contracts: [
      {
        address: dtfAddress,
        abi: dtfIndexAbi,
        functionName: 'totalSupply',
        chainId,
      },
      {
        address: dtfAddress,
        abi: dtfIndexAbi,
        functionName: 'auctionDelay',
        chainId,
      },
      {
        abi: dtfIndexAbi,
        address: dtfAddress,
        functionName: 'toAssets',
        args: [parseEther('1'), 0],
        chainId,
      },
    ],
    allowFailure: false,
    query: {
      select: (data) => {
        const [totalSupply, tradeDelay, assetDistribution] = data
        const [assets, amounts] = assetDistribution
        const distribution = assets.reduce(
          (acc, asset, index) => {
            acc[asset.toLowerCase()] = amounts[index]
            return acc
          },
          {} as Record<string, bigint>
        )

        return [totalSupply, tradeDelay, distribution] as [
          bigint,
          bigint,
          Record<string, bigint>,
        ]
      },
    },
  })

  const priceMap = useAtomValue(indexDTFBasketPricesAtom)

  return useMemo(() => {
    // Need to make sure prices/basket/data exists!
    if (Object.keys(priceMap).length === 0 || !data || !basket?.length)
      return undefined

    const [totalSupply, tradeDelay, distribution] = data

    // Create a copy so the value doesn't mutate!
    const initialBasket = basket.reduce(
      (acc, asset) => {
        acc[asset.address.toLowerCase()] = {
          token: asset,
          currentShares: shares[asset.address.toLowerCase()] ?? '0',
          currentUnits: formatUnits(
            distribution[asset.address.toLowerCase()] ?? 0n,
            asset.decimals
          ),
        }
        return acc
      },
      {} as Record<string, IndexAssetShares>
    )

    return [totalSupply, initialBasket, priceMap, tradeDelay]
  }, [Object.keys(priceMap).length, !!data, basket?.length])
}

const InitialBasketUpdater = () => {
  const initialBasket = useInitialBasket()
  const setProposedBasket = useSetAtom(proposedIndexBasketAtom)
  const setPriceMap = useSetAtom(priceMapAtom)
  const setSupply = useSetAtom(dtfSupplyAtom)
  const setTradeDelay = useSetAtom(dtfTradeDelay)
  const setProposedShares = useSetAtom(proposedSharesAtom)
  const setProposedUnits = useSetAtom(proposedUnitsAtom)

  useEffect(() => {
    if (initialBasket) {
      const [totalSupply, basket, priceMap, tradeDelay] = initialBasket
      setPriceMap(priceMap)
      setProposedShares(
        Object.values(basket).reduce(
          (acc, asset) => {
            acc[asset.token.address.toLowerCase()] = asset.currentShares
            return acc
          },
          {} as Record<string, string>
        )
      )
      setProposedBasket(basket)
      setSupply(totalSupply)
      setTradeDelay(tradeDelay)
      setProposedUnits(
        Object.values(basket).reduce(
          (acc, asset) => {
            acc[asset.token.address.toLowerCase()] = asset.currentUnits
            return acc
          },
          {} as Record<string, string>
        )
      )
    }
  }, [!!initialBasket])

  return null
}

const AtomStateUpdater = () => {
  const setStep = useSetAtom(stepAtom)
  const setProposedBasket = useSetAtom(proposedIndexBasketAtom)
  const setProposedUnits = useSetAtom(proposedUnitsAtom)
  const setTradeVolatility = useSetAtom(tradeVolatilityAtom)
  const [tradeRangeOption, setTradeRangeOption] = useAtom(tradeRangeOptionAtom)
  const setPermissionlessLaunching = useSetAtom(permissionlessLaunchingAtom)
  const tradeConfirmation = useSetAtom(isProposalConfirmedAtom)
  const setProposedShares = useSetAtom(proposedSharesAtom)
  const isDeferAvailable = useAtomValue(isDeferAvailableAtom)

  useEffect(() => {
    const tradeRange = isDeferAvailable ? 'defer' : 'include'
    setTradeRangeOption(tradeRange)
    if (tradeRange === 'defer') {
      setPermissionlessLaunching(PermissionOptionId.NO_PERMISSIONLESS_LAUNCHING)
    } else if (tradeRange === 'include' && !isDeferAvailable) {
      setPermissionlessLaunching(PermissionOptionId.PERMISSIONLESS_LAUNCHING)
    }
  }, [isDeferAvailable])

  useEffect(() => {
    if (tradeRangeOption === 'defer') {
      setPermissionlessLaunching(PermissionOptionId.NO_PERMISSIONLESS_LAUNCHING)
    }
  }, [tradeRangeOption])

  useEffect(() => {
    return () => {
      setStep('basket')
      setProposedShares({})
      setProposedBasket(undefined)
      setTradeVolatility([])
      setTradeRangeOption(undefined)
      setPermissionlessLaunching(undefined)
      tradeConfirmation(false)
      setProposedUnits({})
    }
  }, [])

  return null
}

const Updater = () => {
  return (
    <>
      <AtomStateUpdater />
      <BasketPriceUpdater />
      <InitialBasketUpdater />
    </>
  )
}

export default Updater
