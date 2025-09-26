import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Token, TimeRange } from '@/types'
import { getTokenName } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { ArrowUpRight, Copy } from 'lucide-react'
import { Link } from 'react-router-dom'
import BridgeLabel from './bridge-label'
import { PerformanceCell } from './performance-cell'

interface CollateralTableRowsProps {
  filtered: Token[]
  basketShares: Record<string, string>
  basketPerformanceChanges: Record<string, number | null>
  performanceLoading: boolean
  newlyAddedAssets: Record<string, boolean>
  timeRange: TimeRange
  chainId: number
  viewAll: boolean
  maxTokens: number
  onCopyAddress: (address: string) => void
}

export const CollateralTableRows = ({
  filtered,
  basketShares,
  basketPerformanceChanges,
  performanceLoading,
  newlyAddedAssets,
  timeRange,
  chainId,
  viewAll,
  maxTokens,
  onCopyAddress,
}: CollateralTableRowsProps) => {
  return (
    <>
      {filtered
        .slice(0, viewAll ? filtered.length : maxTokens)
        .map((token) => (
          <TableRow key={token.symbol} className="border-none">
            <TableCell>
              <div className="flex items-center font-semibold gap-3 break-words">
                <TokenLogo
                  size="lg"
                  symbol={token.symbol}
                  address={token.address}
                  chain={chainId}
                />
                <div className="max-w-32 md:max-w-72 lg:max-w-56">
                  <span className="block">
                    {getTokenName(token.name)}
                  </span>
                  <span className="block text-xs text-legend font-normal max-w-32 md:max-w-72 lg:max-w-52 break-words">
                    ${token.symbol}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-primary text-center font-bold">
              {basketShares[token.address]}%
            </TableCell>
            <TableCell className="text-center">
              <PerformanceCell
                change={basketPerformanceChanges[token.address]}
                isLoading={performanceLoading}
                isNewlyAdded={newlyAddedAssets[token.address]}
                timeRange={timeRange}
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <BridgeLabel
                  address={token.address}
                  tokenSymbol={token.symbol}
                  tokenName={token.name}
                />
                <Button
                  variant="muted"
                  size="icon-rounded"
                  className="hover:bg-primary/10 hover:text-primary"
                  onClick={() => onCopyAddress(token.address)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Link
                  to={getExplorerLink(
                    token.address,
                    chainId,
                    ExplorerDataType.TOKEN
                  )}
                  target="_blank"
                >
                  <Button
                    variant="muted"
                    size="icon-rounded"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
    </>
  )
}