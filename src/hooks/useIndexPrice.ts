import { Token } from '@/types'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

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
  return useQuery({
    queryKey: ['index-dtf-price', token],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${RESERVE_API}current/dtf?address=${token}`
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
    retry: 2,
    enabled: !!token,
  })
}

export const useIndexBasket = (token: string | undefined, chainId: number) => {
  const { data: priceResult } = useIndexPrice(token)
  const assets = useMemo(() => {
    if (!priceResult) return []

    return priceResult.basket.map((asset) => asset.address)
  }, [priceResult])
  const { data: basket } = useReadContracts({
    contracts: assets.flatMap((asset) => [
      {
        address: asset,
        abi: erc20Abi,
        functionName: 'name',
        chainId,
      },
      {
        address: asset,
        abi: erc20Abi,
        functionName: 'symbol',
        chainId,
      },
      {
        address: asset,
        abi: erc20Abi,
        functionName: 'decimals',
        chainId,
      },
    ]),
    allowFailure: false,
    query: {
      enabled: assets.length > 0,
      select: (data) => {
        let index = 0
        return assets.map((asset) => {
          const token = {
            address: asset.toLowerCase(),
            name: data[index] as string,
            symbol: data[index + 1] as string,
            decimals: data[index + 2] as number,
          } as Token

          index += 3

          return token
        })
      },
    },
  })

  return useMemo(() => {
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
        price: prices.price,
        basket: basket,
        prices,
        amounts,
        shares,
      },
    }
  }, [basket, priceResult])
}
