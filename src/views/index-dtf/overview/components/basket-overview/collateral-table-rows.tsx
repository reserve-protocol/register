import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { indexDTFExposureDataAtom } from '@/state/dtf/atoms'
import { Token, TimeRange } from '@/types'
import { getTokenName } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Copy } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import BridgeLabel from './bridge-label'
import { PerformanceCell } from './performance-cell'

const EXCHANGE_LABELS: Record<string, string> = {
  nasdaq: 'NASDAQ',
  nyse: 'NYSE',
}

// Ondo tokenized stocks always carry an "on" suffix (e.g. MRVLon)
const formatTokenSymbol = (symbol: string, exchange?: string) =>
  exchange ? `${exchange}: $${symbol.replace(/on$/, '')}` : `$${symbol}`

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
  const exposureData = useAtomValue(indexDTFExposureDataAtom)

  const exchangeByAddress = useMemo(() => {
    const map: Record<string, string> = {}
    for (const group of exposureData ?? []) {
      const exchange = EXCHANGE_LABELS[group.native?.caip2 ?? '']
      if (!exchange) continue
      for (const groupToken of group.tokens) {
        map[groupToken.address.toLowerCase()] = exchange
      }
    }
    return map
  }, [exposureData])

  return (
    <>
      {filtered.slice(0, viewAll ? filtered.length : maxTokens).map((token) => (
        <TableRow key={token.symbol} className="border-none">
          <TableCell>
            <div className="flex items-center font-semibold gap-2 sm:gap-3 break-words">
              <TokenLogo
                size="lg"
                symbol={token.symbol}
                address={token.address}
                chain={chainId}
              />
              <div className="max-w-32 md:max-w-72 lg:max-w-56">
                <span className="block text-sm sm:text-base">
                  {getTokenName(token.name)}
                </span>
                <span className="block text-[10px] sm:text-xs text-legend font-normal max-w-32 md:max-w-72 lg:max-w-52 break-words">
                  {formatTokenSymbol(
                    token.symbol,
                    exchangeByAddress[token.address.toLowerCase()]
                  )}
                </span>
              </div>
            </div>
          </TableCell>
          <TableCell className="text-primary text-center font-bold text-sm sm:text-base px-1 sm:px-3">
            {basketShares[token.address]}%
          </TableCell>
          <TableCell className="text-center px-1 sm:px-3">
            <PerformanceCell
              change={basketPerformanceChanges[token.address]}
              isLoading={performanceLoading}
              isNewlyAdded={newlyAddedAssets[token.address]}
              timeRange={timeRange}
            />
          </TableCell>
          <TableCell className="text-right px-1 sm:px-3">
            <div className="flex items-center justify-end gap-2 flex-wrap-reverse sm:flex-nowrap">
              <BridgeLabel
                address={token.address}
                tokenSymbol={token.symbol}
                tokenName={token.name}
              />
              <Button
                variant="muted"
                size="icon-rounded"
                className="hover:bg-primary/10 hover:text-primary hidden sm:inline-flex"
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
                  className="hover:bg-primary/10 hover:text-primary p-1.5 sm:p-2 h-6 w-6 sm:h-8 sm:w-8"
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
