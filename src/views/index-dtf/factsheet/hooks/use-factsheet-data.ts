import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Address } from 'viem'
import {
  type TimeRange,
  type FactsheetData,
  mockFactsheetData
} from '../mocks/factsheet-data'

interface UseFactsheetDataParams {
  address?: Address
  timeRange: TimeRange
  prefetchRanges?: TimeRange[]
}

const REFRESH_INTERVAL = 1000 * 60 * 30 // 30 minutes

// Mock API call - replace with actual API call later
const fetchFactsheetData = async (
  address: Address | undefined,
  timeRange: TimeRange
): Promise<FactsheetData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Return mock data for now
  return mockFactsheetData[timeRange]
}

export const useFactsheetData = ({
  address,
  timeRange,
  prefetchRanges = []
}: UseFactsheetDataParams) => {
  const queryClient = useQueryClient()

  // Main query for selected time range
  const mainQuery = useQuery({
    queryKey: ['factsheet-data', address, timeRange],
    queryFn: async () => fetchFactsheetData(address, timeRange),
    enabled: Boolean(address),
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL
  })

  // Prefetch other time ranges in background
  useEffect(() => {
    if (!address) return

    prefetchRanges.forEach(range => {
      queryClient.prefetchQuery({
        queryKey: ['factsheet-data', address, range],
        queryFn: async () => fetchFactsheetData(address, range),
        staleTime: REFRESH_INTERVAL
      })
    })
  }, [address, queryClient, prefetchRanges])

  return mainQuery
}