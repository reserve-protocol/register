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
import { formatUnits } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'
import {
  dtfSupplyAtom,
  IndexAssetShares,
  isProposalConfirmedAtom,
  permissionlessLaunchingAtom,
  priceMapAtom,
  proposedIndexBasketAtom,
  proposedSharesAtom,
  proposedUnitsAtom,
  stepAtom,
  tradeRangeOptionAtom,
  dtfTradeDelay,
  isDeferAvailableAtom,
  tradeVolatilityAtom,
  dtfBalancesAtom,
  tokenPriceVolatilityAtom,
} from './atoms'
import { PermissionOptionId } from './components/proposal-rebalance-launch-settings'
import useAssetPriceVolatility from '@/hooks/use-asset-price-volatility'

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
  | [
      bigint,
      Record<string, IndexAssetShares>,
      Record<string, number>,
      bigint | undefined,
      Record<string, bigint> | undefined,
    ]
  | undefined => {
  const dtfAddress = useAtomValue(iTokenAddressAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const shares = useAtomValue(indexDTFBasketSharesAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { data: tradeDelay } = useReadContract({
    address: dtfAddress,
    abi: dtfIndexAbi,
    functionName: 'auctionDelay',
    chainId,
  })
  const { data } = useReadContracts({
    contracts: [
      {
        address: dtfAddress,
        abi: dtfIndexAbi,
        functionName: 'totalSupply',
        chainId,
      },
      {
        abi: dtfIndexAbi,
        address: dtfAddress,
        functionName: 'totalAssets',
        args: [],
        chainId,
      },
    ],
    allowFailure: false,
    query: {
      select: (data) => {
        const [totalSupply, assetDistribution] = data
        const [assets, amounts] = assetDistribution
        const balances = assets.reduce(
          (acc, asset, index) => {
            acc[asset.toLowerCase()] = amounts[index]
            return acc
          },
          {} as Record<string, bigint>
        )

        return [totalSupply, balances] as [bigint, Record<string, bigint>]
      },
    },
  })

  const priceMap = useAtomValue(indexDTFBasketPricesAtom)

  return useMemo(() => {
    // Need to make sure prices/basket/data exists!
    if (Object.keys(priceMap).length === 0 || !data || !basket?.length)
      return undefined

    const [totalSupply, balances] = data
    if (!totalSupply) return undefined

    // Create a copy so the value doesn't mutate!
    const initialBasket = basket.reduce(
      (acc, asset) => {
        acc[asset.address.toLowerCase()] = {
          token: asset,
          currentShares: shares[asset.address.toLowerCase()] ?? '0',
          currentUnits: formatUnits(
            ((balances[asset.address.toLowerCase()] ?? 0n) * 10n ** 18n) /
              totalSupply,
            asset.decimals
          ),
        }
        return acc
      },
      {} as Record<string, IndexAssetShares>
    )

    return [totalSupply, initialBasket, priceMap, tradeDelay, balances]
  }, [Object.keys(priceMap).length, !!data, basket?.length, tradeDelay])
}

const InitialBasketUpdater = () => {
  const initialBasket = useInitialBasket()
  const setProposedBasket = useSetAtom(proposedIndexBasketAtom)
  const setPriceMap = useSetAtom(priceMapAtom)
  const setSupply = useSetAtom(dtfSupplyAtom)
  const setTradeDelay = useSetAtom(dtfTradeDelay)
  const setProposedShares = useSetAtom(proposedSharesAtom)
  const setProposedUnits = useSetAtom(proposedUnitsAtom)
  const setBalances = useSetAtom(dtfBalancesAtom)

  useEffect(() => {
    if (initialBasket) {
      const [totalSupply, basket, priceMap, tradeDelay, balances] =
        initialBasket
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
      setBalances(balances)
      setProposedUnits(
        Object.values(basket).reduce(
          (acc, asset) => {
            acc[asset.token.address.toLowerCase()] = asset.currentUnits
            return acc
          },
          {} as Record<string, string>
        )
      )

      // @deprecated - only required for 1.0/2.0 rebalance flow
      if (tradeDelay) {
        setTradeDelay(tradeDelay)
      }
    }
  }, [!!initialBasket])

  return null
}

const currentAssetsAtom = atom((get) => {
  const basket = get(proposedIndexBasketAtom)
  return Object.values(basket || {}).map((token) =>
    token.token.address.toLowerCase()
  )
})

const TokenPriceVolatilityUpdater = () => {
  const assets = useAtomValue(currentAssetsAtom)
  const volatility = useAssetPriceVolatility(assets)
  const setTokenPriceVolatility = useSetAtom(tokenPriceVolatilityAtom)

  useEffect(() => {
    setTokenPriceVolatility(volatility || {})
  }, [volatility])

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
      setTradeRangeOption('defer')
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
      <TokenPriceVolatilityUpdater />
    </>
  )
}

export default Updater
