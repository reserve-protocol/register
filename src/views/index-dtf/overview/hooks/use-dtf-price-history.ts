import { chainIdAtom } from '@/state/atoms'
import { indexDTFPriceAtom } from '@/state/dtf/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { Address, erc20Abi, formatEther } from 'viem'
import { useReadContract } from 'wagmi'

export type IndexDTFPerformance = {
  address: Address
  timeseries: {
    timestamp: number
    price: number
    marketCap: number
    totalSupply: number
    basket: {
      address: string
      price: number
      amount: number
    }[]
  }[]
}

const REFRESH_INTERVAL = 1000 * 60 * 30 // 30 minutes

export type UseIndexDTFPriceHistoryParams = {
  address?: Address
  from: number
  to: number
  interval: '1h' | '1d'
  prefetchRanges?: Array<{
    from: number
    to: number
    interval: '1h' | '1d'
  }>
}

const useIndexDTFPriceHistory = ({
  address,
  from,
  to,
  interval,
  prefetchRanges = [],
}: UseIndexDTFPriceHistoryParams) => {
  const chainId = useAtomValue(chainIdAtom)
  const currentPrice = useAtomValue(indexDTFPriceAtom)
  const { data: supply } = useReadContract({
    address: address as Address,
    abi: erc20Abi,
    functionName: 'totalSupply',
    chainId,
    query: {
      enabled: Boolean(address),
    },
  })

  const queryClient = useQueryClient()

  // Main query for selected range
  const mainQuery = useQuery({
    queryKey: [
      'dtf-historical-price',
      address,
      from,
      to,
      interval,
      currentPrice,
      supply,
    ],
    queryFn: async (): Promise<IndexDTFPerformance> => {
      const startTime = Date.now()

      const sp = new URLSearchParams()
      sp.set('chainId', chainId.toString())
      sp.set('address', address?.toLowerCase() ?? '')
      sp.set('from', from.toString())
      sp.set('to', to.toString())
      sp.set('interval', interval)

      const response = await fetch(
        `${RESERVE_API}historical/dtf?${sp.toString()}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch dtf price history')
      }

      const data = (await response.json()) as IndexDTFPerformance

      if (currentPrice && supply) {
        const numberSupply = +formatEther(supply)

        data.timeseries.push({
          timestamp: Math.floor(Date.now() / 1_000),
          price: currentPrice,
          marketCap: currentPrice * numberSupply,
          totalSupply: numberSupply,
          basket: [],
        })
      }

      // Ensure minimum loading time of 1 second for loading skeleton
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, 1000 - elapsed)

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime))
      }

      return data
    },
    enabled: Boolean(address && supply && currentPrice),
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })

  // Prefetch other ranges in background
  useEffect(() => {
    if (!address || !supply || !currentPrice || prefetchRanges.length === 0)
      return

    prefetchRanges.forEach((range) => {
      queryClient.prefetchQuery({
        queryKey: [
          'dtf-historical-price',
          address,
          range.from,
          range.to,
          range.interval,
          currentPrice,
          supply,
        ],
        queryFn: async (): Promise<IndexDTFPerformance> => {
          const sp = new URLSearchParams()
          sp.set('chainId', chainId.toString())
          sp.set('address', address?.toLowerCase() ?? '')
          sp.set('from', range.from.toString())
          sp.set('to', range.to.toString())
          sp.set('interval', range.interval)

          const response = await fetch(
            `${RESERVE_API}historical/dtf?${sp.toString()}`
          )

          if (!response.ok) {
            throw new Error('Failed to fetch dtf price history')
          }

          const data = (await response.json()) as IndexDTFPerformance

          if (currentPrice && supply) {
            const numberSupply = +formatEther(supply)

            data.timeseries.push({
              timestamp: Math.floor(Date.now() / 1_000),
              price: currentPrice,
              marketCap: currentPrice * numberSupply,
              totalSupply: numberSupply,
              basket: [],
            })
          }

          return data
        },
        staleTime: REFRESH_INTERVAL,
      })
    })
  }, [address, supply, currentPrice, chainId, queryClient, prefetchRanges])

  return mainQuery
}

export default useIndexDTFPriceHistory
