import TokenLogo from '@/components/token-logo'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatMarketCap } from '@/hooks/use-native-token-market-caps'
import { TimeRange } from '@/types'
import { PerformanceCell } from './performance-cell'

export interface ExposureGroup {
  native?: {
    symbol: string
    name: string
    logo: string
    coingeckoId?: string
  }
  tokens: Array<{
    address: string
    symbol: string
    name?: string
    weight: number
  }>
  totalWeight: number
  weightedChange?: number | null
  hasNewlyAdded?: boolean
}

interface ExposureTableRowsProps {
  exposureGroups: Map<string, ExposureGroup> | Array<[string, ExposureGroup]>
  performanceLoading: boolean
  timeRange: TimeRange
  marketCaps: Record<string, number> | undefined
  viewAll: boolean
  maxTokens: number
}

export const ExposureTableRows = ({
  exposureGroups,
  performanceLoading,
  timeRange,
  marketCaps,
  viewAll,
  maxTokens,
}: ExposureTableRowsProps) => {
  // Convert to array if it's a Map
  const groupsArray = Array.isArray(exposureGroups)
    ? exposureGroups
    : Array.from(exposureGroups.entries())

  return (
    <>
      {groupsArray
        .slice(0, viewAll ? groupsArray.length : maxTokens)
        .map(([key, group]) => {
          const native = group.native || {
            symbol: key,
            name: key,
            logo: '',
          }
          return (
            <TableRow key={native.symbol} className="border-none">
              <TableCell>
                <div className="flex items-center font-semibold gap-2 sm:gap-3 break-words">
                  <TokenLogo size="lg" src={native.logo} />
                  <div className="max-w-32 md:max-w-72 lg:max-w-56">
                    <span className="block text-sm sm:text-base">
                      {native.name}
                    </span>
                    <span className="block text-[10px] sm:text-xs text-legend font-normal max-w-32 md:max-w-72 lg:max-w-52 break-words">
                      ${native.symbol}
                      {group.tokens.length > 1 && (
                        <span className="ml-1 text-muted-foreground">
                          ({group.tokens.length} sources)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center hidden text-base sm:table-cell">
                {group.native?.coingeckoId &&
                marketCaps?.[group.native.coingeckoId] ? (
                  <span>
                    {formatMarketCap(marketCaps[group.native.coingeckoId])}
                  </span>
                ) : (
                  <span>—</span>
                )}
              </TableCell>
              <TableCell className="text-center px-1 sm:px-3">
                <PerformanceCell
                  change={group.weightedChange ?? null}
                  isLoading={performanceLoading}
                  isNewlyAdded={group.hasNewlyAdded || false}
                  timeRange={timeRange}
                />
              </TableCell>
              <TableCell className="text-right text-primary font-bold text-sm sm:text-base px-1 sm:px-3">
                {group.totalWeight.toFixed(2)}%
              </TableCell>
            </TableRow>
          )
        })}
    </>
  )
}
