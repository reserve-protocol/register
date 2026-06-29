import TokenLogo from '@/components/token-logo'
import { TableCell, TableRow } from '@/components/ui/table'
import { chainIdAtom } from '@/state/atoms'
import { TimeRange } from '@/types'
import { formatMarketCap, getTokenName } from '@/utils'
import { Plural } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { PerformanceCell } from './performance-cell'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { ExposureRow, formatExchangeSymbol } from './exposure-rows'

interface ExposureTableRowsProps {
  rows: ExposureRow[]
  performanceLoading: boolean
  timeRange: TimeRange
  marketCaps: Record<string, number> | undefined
  viewAll: boolean
  maxTokens: number
}

export const ExposureTableRows = ({
  rows,
  performanceLoading,
  timeRange,
  marketCaps,
  viewAll,
  maxTokens,
}: ExposureTableRowsProps) => {
  const chainId = useAtomValue(chainIdAtom)
  const basket = useAtomValue(indexDTFBasketAtom)

  const tokenNames = useMemo(() => {
    const map: Record<string, string> = {}
    for (const token of basket ?? []) {
      map[token.address.toLowerCase()] = token.name
    }
    return map
  }, [basket])

  return (
    <>
      {rows.slice(0, viewAll ? rows.length : maxTokens).map((row) => {
        if (row.kind === 'token') {
          const { token, group, exchange } = row
          return (
            <TableRow
              key={row.key}
              className="border-none hover:bg-transparent"
            >
              <TableCell className="w-1/2 min-w-0 py-3 pl-0 pr-2">
                <div className="flex items-center gap-2 break-words font-medium sm:gap-3">
                  <TokenLogo
                    size="xl"
                    symbol={token.symbol}
                    address={token.address}
                    chain={chainId}
                  />
                  <div className="flex min-w-0 max-w-48 flex-col gap-0.5 md:max-w-80 lg:max-w-80">
                    <span className="block text-sm sm:text-base">
                      {getTokenName(
                        tokenNames[token.address.toLowerCase()] ?? ''
                      )}
                    </span>
                    <span className="block max-w-48 break-words text-[10px] font-normal text-legend sm:text-xs md:max-w-72 lg:max-w-80">
                      {formatExchangeSymbol(token.symbol, exchange)}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-20 whitespace-nowrap py-3 pl-2 pr-0 text-right text-sm font-medium text-primary sm:text-base dark:text-foreground">
                {token.weight.toFixed(2)}%
              </TableCell>
              <TableCell className="w-28 py-3 pl-2 pr-0 text-right">
                <PerformanceCell
                  change={token.change ?? group.change ?? null}
                  isLoading={performanceLoading}
                  isNewlyAdded={group.hasNewlyAdded || false}
                  timeRange={timeRange}
                />
              </TableCell>
              <TableCell className="hidden w-28 whitespace-nowrap py-3 pl-2 pr-0 text-right text-base font-medium sm:table-cell dark:text-muted-foreground">
                {marketCaps?.[token.address.toLowerCase()] ? (
                  <span>
                    {formatMarketCap(marketCaps[token.address.toLowerCase()])}
                  </span>
                ) : (
                  <span>—</span>
                )}
              </TableCell>
            </TableRow>
          )
        }

        const { group } = row
        const native = group.native || {
          symbol: row.key,
          name: row.key,
          logo: '',
        }

        return (
          <TableRow key={row.key} className="border-none hover:bg-transparent">
            <TableCell className="w-1/2 min-w-0 py-3 pl-0 pr-2">
              <div className="flex items-center gap-2 break-words font-medium sm:gap-3">
                {native.logo ? (
                  <TokenLogo size="xl" src={native.logo} />
                ) : (
                  <TokenLogo
                    size="xl"
                    symbol={native.symbol}
                    address={group.tokens[0]?.address || ''}
                    chain={chainId}
                  />
                )}
                <div className="flex min-w-0 max-w-52 flex-col gap-0.5 md:max-w-96 lg:max-w-80">
                  <span className="block text-sm sm:text-base">
                    {native.name}
                  </span>
                  <span className="block max-w-52 break-words text-[10px] font-normal text-legend sm:text-xs md:max-w-96 lg:max-w-80">
                    ${native.symbol}
                    {group.tokens.length > 1 && (
                      <span className="ml-1 text-muted-foreground">
                        <Plural
                          value={group.tokens.length}
                          one="(# source)"
                          other="(# sources)"
                        />
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="w-20 whitespace-nowrap py-3 pl-2 pr-0 text-right text-sm font-medium text-primary sm:text-base dark:text-foreground">
              {group.totalWeight.toFixed(2)}%
            </TableCell>
            <TableCell className="w-28 py-3 pl-2 pr-0 text-right">
              <PerformanceCell
                change={group.change ?? null}
                isLoading={performanceLoading}
                isNewlyAdded={group.hasNewlyAdded || false}
                timeRange={timeRange}
              />
            </TableCell>
            <TableCell className="hidden w-28 whitespace-nowrap py-3 pl-2 pr-0 text-right text-base font-medium sm:table-cell dark:text-muted-foreground">
              {group.native?.coingeckoId &&
              marketCaps?.[group.native.coingeckoId] ? (
                <span>
                  {formatMarketCap(marketCaps[group.native.coingeckoId])}
                </span>
              ) : !group.native?.coingeckoId &&
                marketCaps?.[group.tokens[0]?.address.toLowerCase()] ? (
                <span>
                  {formatMarketCap(
                    marketCaps[group.tokens[0]?.address.toLowerCase()]
                  )}
                </span>
              ) : (
                <span>—</span>
              )}
            </TableCell>
          </TableRow>
        )
      })}
    </>
  )
}
