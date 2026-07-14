import TokenLogo from '@/components/token-logo'
import { TableCell, TableRow } from '@/components/ui/table'
import { Token, TimeRange } from '@/types'
import { formatMarketCap, getTokenName } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { ArrowUpRight } from 'lucide-react'
import BridgeLabel from './bridge-label'
import { MarketCapCell } from './market-cap-cell'
import { PerformanceCell } from './performance-cell'

interface CollateralTableRowsProps {
  filtered: Token[]
  basketShares: Record<string, string>
  basketPerformanceChanges: Record<string, number | null>
  performanceLoading: boolean
  newlyAddedAssets: Record<string, boolean>
  timeRange: TimeRange
  marketCaps: Record<string, number> | undefined
  chainId: number
  viewAll: boolean
  maxTokens: number
}

export const CollateralTableRows = ({
  filtered,
  basketShares,
  basketPerformanceChanges,
  performanceLoading,
  newlyAddedAssets,
  timeRange,
  marketCaps,
  chainId,
  viewAll,
  maxTokens,
}: CollateralTableRowsProps) => {
  return (
    <>
      {filtered.slice(0, viewAll ? filtered.length : maxTokens).map((token) => {
        const explorerLink = getExplorerLink(
          token.address,
          chainId,
          ExplorerDataType.TOKEN
        )
        const cap = marketCaps?.[token.address.toLowerCase()]
        const marketCap = cap ? formatMarketCap(cap) : undefined

        return (
          <TableRow
            key={token.address}
            data-testid="overview-basket-row"
            className="border-none hover:bg-transparent"
          >
            <TableCell className="w-1/2 min-w-0 py-3 pl-0 pr-2">
              <div className="flex items-center gap-2 font-medium sm:gap-3">
                <a
                  href={explorerLink}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0"
                >
                  <TokenLogo
                    size="xl"
                    symbol={token.symbol}
                    address={token.address}
                    chain={chainId}
                  />
                </a>
                <div className="flex min-w-0 max-w-full flex-col gap-0.5">
                  <a
                    href={explorerLink}
                    target="_blank"
                    rel="noreferrer"
                    className="group/token relative inline-block max-w-full pr-4 text-sm font-medium transition-colors hover:text-primary sm:text-base"
                  >
                    <span>{getTokenName(token.name, false)}</span>
                    <ArrowUpRight className="absolute right-0 top-1 h-3 w-3 text-muted-foreground opacity-0 transition-colors group-hover/token:text-primary group-hover/token:opacity-100 group-focus-visible/token:text-primary group-focus-visible/token:opacity-100" />
                  </a>
                  <span className="flex max-w-full items-center gap-1 break-words text-[10px] font-normal text-legend sm:text-xs">
                    <a
                      href={explorerLink}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-primary"
                    >
                      ${token.symbol}
                    </a>
                    <span className="text-[8px] leading-none text-muted-foreground">
                      •
                    </span>
                    <BridgeLabel
                      address={token.address}
                      tokenSymbol={token.symbol}
                      tokenName={token.name}
                      compact
                    />
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="w-16 whitespace-nowrap py-3 pl-2 pr-0 text-right text-sm font-medium text-primary sm:text-base dark:text-foreground">
              {basketShares[token.address]}%
            </TableCell>
            <TableCell className="w-28 whitespace-nowrap py-3 pl-3 pr-0 text-right">
              <PerformanceCell
                change={basketPerformanceChanges[token.address]}
                isLoading={performanceLoading}
                isNewlyAdded={newlyAddedAssets[token.address]}
                timeRange={timeRange}
              />
            </TableCell>
            <MarketCapCell marketCap={marketCap} />
          </TableRow>
        )
      })}
    </>
  )
}
