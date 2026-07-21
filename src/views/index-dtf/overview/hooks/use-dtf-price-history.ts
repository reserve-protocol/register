import { indexDTFPriceAtom } from '@/state/dtf/atoms'
import {
  useIndexDtfIdentity,
  useIndexDtfPerformance,
  usePrefetchIndexDtfPriceHistory,
  type IndexDtfPerformancePoint,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Address, erc20Abi, formatEther } from 'viem'
import { useReadContract } from 'wagmi'

export type IndexDTFPerformance = {
  address: Address
  timeseries: readonly IndexDtfPerformancePoint[]
}

const REFRESH_INTERVAL = 1000 * 60 * 30 // 30 minutes

// The only granularities historical/dtf serves — anything else is HTTP 400.
export type FetchInterval = '5m' | '1h' | '1d'

export type UseIndexDTFPriceHistoryParams = {
  address?: Address
  from: number
  to: number
  interval: FetchInterval
  enabled?: boolean
  prefetchRanges?: Array<{
    from: number
    to: number
    interval: FetchInterval
  }>
}

const useIndexDTFPriceHistory = ({
  address,
  from,
  to,
  interval,
  enabled = true,
  prefetchRanges = [],
}: UseIndexDTFPriceHistoryParams) => {
  const { chainId } = useIndexDtfIdentity()
  const currentPrice = useAtomValue(indexDTFPriceAtom)
  const { data: supply } = useReadContract({
    address: address as Address,
    abi: erc20Abi,
    functionName: 'totalSupply',
    chainId,
    query: {
      enabled: Boolean(enabled && address),
    },
  })

  const prefetch = usePrefetchIndexDtfPriceHistory()

  // The SDK owns dedupe + the live point (chart end stays in sync with the
  // header price); the cache entry stays the raw series under the canonical
  // key, shared with every other price-history consumer.
  const query = useIndexDtfPerformance(
    address
      ? {
          address,
          chainId,
          from,
          to,
          interval,
          currentPrice,
          currentTotalSupply:
            supply !== undefined ? +formatEther(supply) : undefined,
        }
      : undefined,
    {
      enabled: Boolean(enabled && address && supply && currentPrice),
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL,
    }
  )

  const data = useMemo<IndexDTFPerformance | undefined>(
    () =>
      query.data && address ? { address, timeseries: query.data } : undefined,
    [query.data, address]
  )

  // Prefetch other ranges under the SAME SDK keys.
  useEffect(() => {
    if (
      !enabled ||
      !address ||
      !supply ||
      !currentPrice ||
      prefetchRanges.length === 0
    ) {
      return
    }

    prefetchRanges.forEach((range) => {
      prefetch(
        {
          address,
          chainId,
          from: range.from,
          to: range.to,
          interval: range.interval,
        },
        REFRESH_INTERVAL
      )
    })
  }, [enabled, address, supply, currentPrice, chainId, prefetchRanges, prefetch])

  return { ...query, data }
}

export default useIndexDTFPriceHistory
