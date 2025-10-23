import { gql } from 'graphql-request'
import { atom } from 'jotai'
import { atomWithLoadable } from '@/utils/atoms/utils'
import { useMultichainQuery } from '@/hooks/useQuery'
import { rsrPriceAtom } from '@/state/atoms'
import { PROTOCOL_SLUG, supportedChainList } from '@/utils/constants'

// Query to fetch cumulative revenue for RSR stakers and RToken holders
const protocolRevenueQuery = gql`
  query GetProtocolRevenue($id: String!) {
    protocol(id: $id) {
      cumulativeRTokenRevenueUSD
      cumulativeRSRRevenueUSD
      rsrRevenue
    }
  }
`

// Simple atom to aggregate revenue across all chains
export const rsrRevenueMetricsAtom = atomWithLoadable(async (get) => {
  const rsrPrice = get(rsrPriceAtom) || 0

  // We need to fetch from all chains and aggregate
  // This will be done through the useMultichainQuery hook in the component
  // For now, return structure
  return {
    holdersRevenueUSD: 0,
    stakersRevenueUSD: 0,
    stakersRevenueRSR: 0,
    totalRevenueUSD: 0,
  }
})

// Atom to calculate the revenue split percentages
export const rsrRevenueSplitPercentageAtom = atom((get) => {
  const metrics = get(rsrRevenueMetricsAtom)

  if (!metrics || typeof metrics !== 'object' || !('holdersRevenueUSD' in metrics)) {
    return { holders: 0, stakers: 0 }
  }

  const total = metrics.totalRevenueUSD
  if (total === 0) {
    return { holders: 0, stakers: 0 }
  }

  return {
    holders: (metrics.holdersRevenueUSD / total) * 100,
    stakers: (metrics.stakersRevenueUSD / total) * 100,
  }
})