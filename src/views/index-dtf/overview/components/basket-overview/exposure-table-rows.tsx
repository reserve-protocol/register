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
import { ExposureRow } from './exposure-rows'

// Ondo tokenized stocks always carry an "on" suffix (e.g. MRVLon)
const formatExchangeSymbol = (symbol: string, exchange: string) =>
  `${exchange}: $${symbol.replace(/on$/, '')}`

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
            <TableRow key={row.key} className="border-none">
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
                      {getTokenName(
                        tokenNames[token.address.toLowerCase()] ?? ''
                      )}
                    </span>
                    <span className="block text-[10px] sm:text-xs text-legend font-normal max-w-32 md:max-w-72 lg:max-w-52 break-words">
                      {formatExchangeSymbol(token.symbol, exchange)}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-primary text-center font-bold text-sm sm:text-base px-1 sm:px-3">
                {token.weight.toFixed(2)}%
              </TableCell>
              <TableCell className="text-center  px-1 sm:px-3">
                <PerformanceCell
                  change={token.change ?? group.change ?? null}
                  isLoading={performanceLoading}
                  isNewlyAdded={group.hasNewlyAdded || false}
                  timeRange={timeRange}
                />
              </TableCell>
              <TableCell className="text-center hidden text-base sm:table-cell">
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
          <TableRow key={row.key} className="border-none">
            <TableCell>
              <div className="flex items-center font-semibold gap-2 sm:gap-3 break-words">
                {native.logo ? (
                  <TokenLogo size="lg" src={native.logo} />
                ) : (
                  <TokenLogo
                    size="lg"
                    symbol={native.symbol}
                    address={group.tokens[0]?.address || ''}
                    chain={chainId}
                  />
                )}
                <div className="max-w-32 md:max-w-72 lg:max-w-56">
                  <span className="block text-sm sm:text-base">
                    {native.name}
                  </span>
                  <span className="block text-[10px] sm:text-xs text-legend font-normal max-w-32 md:max-w-72 lg:max-w-52 break-words">
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
            <TableCell className="text-primary text-center font-bold text-sm sm:text-base px-1 sm:px-3">
              {group.totalWeight.toFixed(2)}%
            </TableCell>
            <TableCell className="text-center  px-1 sm:px-3">
              <PerformanceCell
                change={group.change ?? null}
                isLoading={performanceLoading}
                isNewlyAdded={group.hasNewlyAdded || false}
                timeRange={timeRange}
              />
            </TableCell>
            <TableCell className="text-center hidden text-base sm:table-cell">
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
