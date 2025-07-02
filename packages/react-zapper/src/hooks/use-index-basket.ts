import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address } from 'viem'
import { Token } from '../types'

const RESERVE_API = 'https://api.reserve.org/'

type Response = {
  price: number
  basket: {
    address: Address
    amount: number
    price: number
    weight: string
  }[]
}

const useIndexPrice = (token: string | undefined, chainId: number) => {
  return useQuery({
    queryKey: ['index-price', token, chainId],
    queryFn: async (): Promise<Response> => {
      if (!token) throw new Error('Token address is required')

      const sp = new URLSearchParams()
      sp.set('chainId', chainId.toString())
      sp.set('address', token.toLowerCase())

      const response = await fetch(`${RESERVE_API}current/dtf?${sp.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch dtf price')
      }

      return (await response.json()) as Response
    },
    enabled: !!token,
  })
}

const useTokensInfo = (addresses: Address[]) => {
  return useQuery({
    queryKey: ['tokens-info', addresses],
    queryFn: async () => {
      if (!addresses.length) return {}

      // For now, create basic token info from addresses
      // In a real implementation, you'd fetch from a token list or API
      return addresses.reduce(
        (acc, address) => {
          acc[address] = {
            address,
            symbol: 'TOKEN', // Would be fetched from token contract or API
            name: 'Token', // Would be fetched from token contract or API
            decimals: 18, // Would be fetched from token contract
            chainId: 1, // Would be determined from context
          } as Token
          return acc
        },
        {} as Record<string, Token>
      )
    },
    enabled: addresses.length > 0,
  })
}

export const useIndexBasket = (token: string | undefined, chainId: number) => {
  const { data: priceResult } = useIndexPrice(token, chainId)
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
