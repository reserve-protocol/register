import { chainIdAtom } from '@/state/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address } from 'viem'
import useTokensInfo from './useTokensInfo'

type Response = {
  price: number
  basket: {
    address: Address
    amount: number
    price: number
    weight: string
  }[]
}

const useIndexPrice = (token: string | undefined) => {
  const chainId = useAtomValue(chainIdAtom)
  return useQuery({
    queryKey: ['index-dtf-price', token, chainId],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${RESERVE_API}current/dtf?address=${token}&chainId=${chainId}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch token prices')
        }
        const data = (await response.json()) as Response

        return data
      } catch (error) {
        console.error('Error fetching token prices:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 5,
    enabled: !!token,
  })
}

export const useIndexBasket = (token: string | undefined, chainId: number) => {
  const { data: priceResult } = useIndexPrice(token)
  const assets = useMemo(
    () => priceResult?.basket?.map((asset) => asset.address) || [],
    [priceResult]
  )

  const { data: basketMap } = useTokensInfo(assets)

  return useMemo(() => {
    const basket = Object.values(basketMap || {})
    if (!basket || !priceResult || !token)
      return {
        isLoading: true,
        data: {
          price: 0,
          basket: [],
          prices: {},
          amounts: {},
          shares: {},
        },
      }

    let totalUsd = 0

    const { prices, amounts, shares } = priceResult.basket.reduce(
      (acc, asset) => {
        totalUsd += asset.amount * asset.price
        acc.prices[asset.address.toLowerCase()] = asset.price
        acc.amounts[asset.address.toLowerCase()] = asset.amount * asset.price
        acc.shares[asset.address.toLowerCase()] = asset.weight
        return acc
      },
      {
        prices: { [token.toLowerCase()]: priceResult.price } as Record<
          string,
          number
        >,
        amounts: {} as Record<string, number>,
        shares: {} as Record<string, string>,
      }
    )

    return {
      isLoading: false,
      data: {
        price: priceResult.price,
        basket: basket,
        prices: { ...prices, [token.toLowerCase()]: priceResult.price },
        amounts,
        shares,
      },
    }
  }, [basketMap, priceResult])
}
