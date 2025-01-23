import dtfIndexAbi from '@/abis/dtf-index-abi'
import {
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  iTokenAddressAtom,
} from '@/state/dtf/atoms'
import { truncateDecimals } from '@/utils'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'
import {
  dtfSupplyAtom,
  IndexAssetShares,
  isProposalConfirmedAtom,
  permissionlessLaunchingAtom,
  priceMapAtom,
  proposedIndexBasketAtom,
  proposedSharesAtom,
  stepAtom,
  tradeRangeOptionAtom,
  tradeVolatilityAtom,
} from './atoms'

const PRICES_BASE_URL =
  'http://reserve-api-base-alb-979856128.us-east-1.elb.amazonaws.com/current/prices?tokens='

const tokensUrlAtom = atom((get) => {
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

  return `${PRICES_BASE_URL}${addresses.join(',')}`
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
  | [bigint, Record<string, IndexAssetShares>, Record<string, number>]
  | undefined => {
  const dtfAddress = useAtomValue(iTokenAddressAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const { data } = useReadContracts({
    contracts: [
      {
        address: dtfAddress,
        abi: dtfIndexAbi,
        functionName: 'totalSupply',
      },
      {
        address: dtfAddress,
        abi: dtfIndexAbi,
        functionName: 'totalAssets',
      },
    ],
    allowFailure: false,
  })
  const priceMap = useAtomValue(indexDTFBasketPricesAtom)

  return useMemo(() => {
    // Need to make sure prices/basket/data exists!
    if (Object.keys(priceMap).length === 0 || !data || !basket) return undefined

    // const initialBasket: Record<string, IndexAssetShares> = {}
    const [totalSupply, [assetAddresses, assetBalances]] = data
    let totalUsd = 0

    const initialBasket = basket.reduce(
      (acc, asset) => {
        acc[asset.address.toLowerCase()] = {
          token: asset,
          balance: 0n,
          currentShares: '0',
        }
        return acc
      },
      {} as Record<string, IndexAssetShares>
    )

    for (let i = 0; i < assetAddresses.length; i++) {
      // TODO: Should always exists! edge case when it doesnt match?
      if (initialBasket[assetAddresses[i].toLowerCase()]) {
        initialBasket[assetAddresses[i].toLowerCase()].balance =
          assetBalances[i]
        totalUsd +=
          Number(
            formatUnits(
              assetBalances[i],
              initialBasket[assetAddresses[i].toLowerCase()].token.decimals
            )
          ) * priceMap[assetAddresses[i].toLowerCase()]
      }
    }

    // Now with total Usd, we can calculate the shares!
    // We traverse everything except the last one, to round the total to 100%
    let shareSum = 0
    for (let i = 0; i < basket.length - 1; i++) {
      const token = initialBasket[basket[i].address.toLowerCase()]
      console.log('token', token)
      console.log('priceMap', priceMap)
      const usdValue =
        Number(formatUnits(token.balance, token.token.decimals)) *
        priceMap[token.token.address.toLowerCase()]
      const share = truncateDecimals((usdValue / totalUsd) * 100, 2)

      console.log('usdValue', usdValue)
      console.log('share', share)
      shareSum += share
      token.currentShares = share.toString()
    }

    // Now for the last one, we need to round to 100%
    const lastShare = 100 - shareSum
    initialBasket[
      basket[basket.length - 1].address.toLowerCase()
    ].currentShares = truncateDecimals(lastShare, 2).toString()

    return [totalSupply, initialBasket, priceMap]
  }, [Object.keys(priceMap).length, !!data, !!basket])
}

const InitialBasketUpdater = () => {
  const initialBasket = useInitialBasket()
  const setProposedBasket = useSetAtom(proposedIndexBasketAtom)
  const setPriceMap = useSetAtom(priceMapAtom)
  const setSupply = useSetAtom(dtfSupplyAtom)
  const setProposedShares = useSetAtom(proposedSharesAtom)

  useEffect(() => {
    if (initialBasket) {
      const [totalSupply, basket, priceMap] = initialBasket
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
    }
  }, [!!initialBasket])

  return null
}

const AtomStateUpdater = () => {
  const setStep = useSetAtom(stepAtom)
  const setProposedBasket = useSetAtom(proposedIndexBasketAtom)
  const setTradeVolatility = useSetAtom(tradeVolatilityAtom)
  const setTradeRangeOption = useSetAtom(tradeRangeOptionAtom)
  const setPermissionlessLaunching = useSetAtom(permissionlessLaunchingAtom)
  const tradeConfirmation = useSetAtom(isProposalConfirmedAtom)
  const setProposedShares = useSetAtom(proposedSharesAtom)

  useEffect(() => {
    return () => {
      setStep('basket')
      setProposedShares({})
      setProposedBasket(undefined)
      setTradeVolatility([])
      setTradeRangeOption(undefined)
      setPermissionlessLaunching(undefined)
      tradeConfirmation(false)
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
