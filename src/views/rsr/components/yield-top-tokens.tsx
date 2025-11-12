import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DecimalDisplay } from '@/components/decimal-display'
import { formatCurrency } from '@/utils'
import { TrendingUp, ExternalLink, Calendar } from 'lucide-react'
import { getExplorerLink, ExplorerDataType } from '@/utils/getExplorerLink'

interface TopToken {
  id: string
  chainId: number
  token: {
    symbol: string
    name: string
    totalSupply: string
    lastPriceUSD: string
    holderCount?: string
  }
  totalRevenue: number
  tvl: number
  monthlyAvgHolders: number
  monthlyAvgStakers: number
  monthlyAvgTotal: number
  holdersRewardShare: number
  stakersRewardShare: number
  rsrStakedAmount: number
  rsrStakedValue: number
  targetUnits?: string
}

interface YieldTopTokensProps {
  tokens: TopToken[]
  isLoading: boolean
}

const YieldTopTokens = ({ tokens, isLoading }: YieldTopTokensProps) => {
  // Get chain name for display
  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'ETH'
      case 8453:
        return 'BASE'
      case 42161:
        return 'ARB'
      default:
        return 'Unknown'
    }
  }

  return (
    <Card className="border-2 border-secondary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="rounded-full border border-foreground p-2">
            <TrendingUp size={16} />
          </div>
          Top Yield DTFs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[400px]" />
        ) : tokens.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No revenue generating DTFs found
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground mb-3">
              Top 5 by Total Revenue Generated
            </div>

            <div className="space-y-2">
              {tokens.map((token, index) => (
                <div
                  key={`${token.chainId}-${token.id}`}
                  className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Rank & Token Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {token.token.symbol}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {getChainName(token.chainId)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {token.token.name}
                        </div>
                      </div>
                    </div>

                    {/* Right: Revenue & TVL */}
                    <div className="text-right space-y-1">
                      <div>
                        <div className="font-semibold text-sm flex items-baseline justify-end gap-0.5">
                          <span>$</span>
                          <DecimalDisplay
                            value={token.totalRevenue}
                            decimals={0}
                            compact={true}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Revenue
                        </div>
                      </div>
                      <div>
                        <div className="text-sm flex items-baseline justify-end gap-0.5">
                          <span>$</span>
                          <DecimalDisplay
                            value={token.tvl}
                            decimals={0}
                            compact={true}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          TVL
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Revenue Stats */}
                  {token.monthlyAvgTotal > 0 && (
                    <div className="mt-3 p-2 bg-primary/5 rounded-md">
                      <div className="flex items-center gap-1 mb-2">
                        <Calendar size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Last 30 Days Revenue
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Total</span>
                          <p className="font-semibold">
                            ${formatCurrency(token.monthlyAvgTotal, 0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Holders</span>
                          <p className="font-mono">
                            ${formatCurrency(token.monthlyAvgHolders, 0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stakers</span>
                          <p className="font-mono">
                            ${formatCurrency(token.monthlyAvgStakers, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom: Revenue Split & RSR Staked */}
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">
                          Revenue Split (H/S)
                        </span>
                        <p className="font-mono mt-0.5">
                          {Math.round(token.holdersRewardShare)}/
                          {Math.round(token.stakersRewardShare)}
                        </p>
                      </div>
                      {token.rsrStakedAmount > 0 && (
                        <div>
                          <span className="text-muted-foreground">
                            RSR Staked
                          </span>
                          <p className="font-mono mt-0.5 flex items-baseline gap-0.5">
                            <DecimalDisplay
                              value={token.rsrStakedAmount}
                              decimals={0}
                              compact={true}
                              currency={false}
                            />
                            <span className="text-[10px] text-muted-foreground">
                              ($<DecimalDisplay
                                value={token.rsrStakedValue}
                                decimals={0}
                                compact={true}
                              />)
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* External Link */}
                  <a
                    href={getExplorerLink(token.id, token.chainId, ExplorerDataType.TOKEN)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                  >
                    View on Explorer
                    <ExternalLink size={10} />
                  </a>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="pt-3 border-t">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Revenue</span>
                  <p className="font-semibold flex items-baseline gap-0.5">
                    <span>$</span>
                    <DecimalDisplay
                      value={tokens.reduce((sum, t) => sum + t.totalRevenue, 0)}
                      decimals={0}
                      compact={true}
                    />
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total TVL</span>
                  <p className="font-semibold flex items-baseline gap-0.5">
                    <span>$</span>
                    <DecimalDisplay
                      value={tokens.reduce((sum, t) => sum + t.tvl, 0)}
                      decimals={0}
                      compact={true}
                    />
                  </p>
                </div>
              </div>

              {/* Monthly Summary */}
              <div className="mt-3 pt-3 border-t">
                <span className="text-sm text-muted-foreground">
                  Combined 30-Day Revenue
                </span>
                <p className="font-semibold text-lg flex items-baseline gap-0.5">
                  <span>$</span>
                  <DecimalDisplay
                    value={tokens.reduce((sum, t) => sum + t.monthlyAvgTotal, 0)}
                    decimals={0}
                    compact={true}
                  />
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default YieldTopTokens