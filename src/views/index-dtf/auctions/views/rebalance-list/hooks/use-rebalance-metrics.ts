import { useEffect, useState } from 'react'

export interface RebalanceMetrics {
  auctionsRun: number
  priceImpact: number // percentage
  rebalanceAccuracy: number // percentage
  deviationFromTarget: number // percentage
}

/**
 * Mock hook to simulate fetching rebalance metrics
 * In production, this would fetch from an API or subgraph
 */
export const useRebalanceMetrics = (proposalId: string) => {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<RebalanceMetrics | null>(null)

  useEffect(() => {
    // Reset state when proposalId changes
    setLoading(true)
    setMetrics(null)

    // Simulate API call with random delay between 1-2 seconds
    const delay = 1000 + Math.random() * 1000
    const timeout = setTimeout(() => {
      // Generate mock metrics with some randomness for realism
      const mockMetrics: RebalanceMetrics = {
        auctionsRun: Math.floor(Math.random() * 8) + 1, // 1-8 auctions
        priceImpact: Number((Math.random() * 2).toFixed(2)), // 0-2%
        rebalanceAccuracy: Number((95 + Math.random() * 4.9).toFixed(1)), // 95-99.9%
        deviationFromTarget: Number((Math.random() * 1.5).toFixed(2)), // 0-1.5%
      }

      setMetrics(mockMetrics)
      setLoading(false)
    }, delay)

    return () => clearTimeout(timeout)
  }, [proposalId])

  return { loading, metrics }
}