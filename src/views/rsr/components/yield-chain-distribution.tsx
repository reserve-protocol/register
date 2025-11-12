import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils'
import { Network } from 'lucide-react'
import { useMemo } from 'react'

interface ChainData {
  revenue: number
  tvl: number
  holdersRevenue: number
  stakersRevenue: number
  rTokenCount: number
}

interface YieldChainDistributionProps {
  perChain: Record<string, ChainData>
  totalRevenue: number
  isLoading: boolean
}

const YieldChainDistribution = ({
  perChain,
  totalRevenue,
  isLoading
}: YieldChainDistributionProps) => {
  // Chain configuration
  const chainConfig: Record<string, {
    name: string
    color: string
    lightColor: string
    borderColor: string
  }> = {
    '1': {
      name: 'Ethereum',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    '8453': {
      name: 'Base',
      color: 'bg-cyan-500',
      lightColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    },
    '42161': {
      name: 'Arbitrum',
      color: 'bg-orange-500',
      lightColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    }
  }

  // Calculate percentages and sort chains
  const chainStats = useMemo(() => {
    if (!perChain || !Object.keys(perChain).length) return []

    return Object.entries(perChain)
      .map(([chainId, data]) => ({
        chainId,
        ...data,
        revenuePercentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
        config: chainConfig[chainId] || {
          name: `Chain ${chainId}`,
          color: 'bg-gray-500',
          lightColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20'
        }
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [perChain, totalRevenue])

  // Calculate dominance (largest chain percentage)
  const dominance = useMemo(() => {
    if (!chainStats.length) return null
    const topChain = chainStats[0]
    return {
      name: topChain.config.name,
      percentage: topChain.revenuePercentage
    }
  }, [chainStats])

  return (
    <Card className="border-2 border-secondary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="rounded-full border border-foreground p-2">
            <Network size={16} />
          </div>
          Chain Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[200px]" />
        ) : chainStats.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No chain data available
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual Progress Bars */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Revenue by Chain</p>

              {chainStats.map((chain) => (
                <div key={chain.chainId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${chain.config.color}`} />
                      <span className="font-medium">{chain.config.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({chain.rTokenCount} DTFs)
                      </span>
                    </div>
                    <span className="font-mono text-sm">
                      {chain.revenuePercentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${chain.config.color} transition-all duration-500`}
                      style={{ width: `${chain.revenuePercentage}%` }}
                    />
                  </div>

                  {/* Chain Stats */}
                  <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                    <div>
                      Revenue: <span className="font-mono text-foreground">
                        ${formatCurrency(chain.revenue, 0)}
                      </span>
                    </div>
                    <div>
                      TVL: <span className="font-mono text-foreground">
                        ${formatCurrency(chain.tvl, 0)}
                      </span>
                    </div>
                    <div>
                      H/S Split: <span className="font-mono text-foreground">
                        {Math.round((chain.holdersRevenue / chain.revenue) * 100)}/
                        {Math.round((chain.stakersRevenue / chain.revenue) * 100)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="pt-4 border-t space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Total Chains
                  </p>
                  <p className="text-lg font-semibold">
                    {chainStats.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Total DTFs
                  </p>
                  <p className="text-lg font-semibold">
                    {chainStats.reduce((sum, c) => sum + c.rTokenCount, 0)}
                  </p>
                </div>
              </div>

              {dominance && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground mb-1">
                    Chain Dominance
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">{dominance.name}</span>
                    {' '}accounts for{' '}
                    <span className="font-semibold">
                      {dominance.percentage.toFixed(1)}%
                    </span>
                    {' '}of total revenue
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default YieldChainDistribution