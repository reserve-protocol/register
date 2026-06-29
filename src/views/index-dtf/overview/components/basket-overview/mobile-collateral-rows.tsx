import { Token, TimeRange } from '@/types'
import { getTokenName } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { Trans } from '@lingui/react/macro'
import { ArrowUpRight } from 'lucide-react'
import { TIME_RANGE_LABELS } from './basket-table-header'
import BridgeLabel from './bridge-label'
import { MobileTokenLogo } from './mobile-row-layout'
import { PerformanceCell } from './performance-cell'

interface MobileCollateralRowsProps {
  filtered: Token[]
  basketShares: Record<string, string>
  basketPerformanceChanges: Record<string, number | null>
  performanceLoading: boolean
  newlyAddedAssets: Record<string, boolean>
  timeRange: TimeRange
  chainId: number
  viewAll: boolean
  maxTokens: number
}

export const MobileCollateralRows = ({
  filtered,
  basketShares,
  basketPerformanceChanges,
  performanceLoading,
  newlyAddedAssets,
  timeRange,
  chainId,
  viewAll,
  maxTokens,
}: MobileCollateralRowsProps) => (
  <div className="flex flex-col pl-5 sm:hidden">
    {filtered.slice(0, viewAll ? filtered.length : maxTokens).map((token) => {
      const explorerLink = getExplorerLink(
        token.address,
        chainId,
        ExplorerDataType.TOKEN
      )

      return (
        <div
          key={token.symbol}
          className="border-b border-border py-5 last:border-b-0"
        >
          <div className="flex items-start justify-between gap-4 pr-5">
            <div className="min-w-0">
              <a
                href={explorerLink}
                target="_blank"
                rel="noreferrer"
                className="group/token inline max-w-full break-words text-base font-medium transition-colors hover:text-primary"
              >
                <span>{getTokenName(token.name, false)}</span>
                <ArrowUpRight className="mb-0.5 ml-1 inline-block h-3.5 w-3.5 text-muted-foreground transition-colors group-hover/token:text-primary" />
              </a>
            </div>
            <div className="shrink-0 text-right text-base font-medium text-primary dark:text-foreground">
              {basketShares[token.address]}%
            </div>
          </div>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,max-content)] items-start gap-x-4 pr-5">
            <div className="min-w-0">
              <div className="text-xs leading-none text-muted-foreground">
                <Trans>Symbol</Trans>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <div className="shrink-0 [&_img]:h-4 [&_img]:w-4">
                  <MobileTokenLogo
                    symbol={token.symbol}
                    address={token.address}
                    chain={chainId}
                  />
                </div>
                <span className="min-w-0 truncate">${token.symbol}</span>
                <BridgeLabel
                  address={token.address}
                  tokenSymbol={token.symbol}
                  tokenName={token.name}
                  compact
                />
              </div>
            </div>
            <div className="min-w-0 text-right">
              <div className="text-xs leading-none text-muted-foreground">
                <Trans>Price Change ({TIME_RANGE_LABELS[timeRange]})</Trans>
              </div>
              <div className="mt-1.5 text-sm font-medium">
                <PerformanceCell
                  change={basketPerformanceChanges[token.address]}
                  isLoading={performanceLoading}
                  isNewlyAdded={newlyAddedAssets[token.address]}
                  timeRange={timeRange}
                />
              </div>
            </div>
          </div>
        </div>
      )
    })}
  </div>
)
