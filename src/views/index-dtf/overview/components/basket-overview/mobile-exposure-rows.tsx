import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { TimeRange } from '@/types'
import { formatMarketCap, getTokenName } from '@/utils'
import { Plural, Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { ExposureRow, formatExchangeSymbol } from './exposure-rows'
import { TIME_RANGE_LABELS } from './basket-table-header'
import { MobileTokenLogo } from './mobile-row-layout'
import { PerformanceCell } from './performance-cell'

interface MobileExposureRowsProps {
  rows: ExposureRow[]
  performanceLoading: boolean
  timeRange: TimeRange
  marketCaps: Record<string, number> | undefined
  viewAll: boolean
  maxTokens: number
}

export const MobileExposureRows = ({
  rows,
  performanceLoading,
  timeRange,
  marketCaps,
  viewAll,
  maxTokens,
}: MobileExposureRowsProps) => {
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
    <div className="flex flex-col pl-5 sm:hidden">
      {rows.slice(0, viewAll ? rows.length : maxTokens).map((row) => {
        const isToken = row.kind === 'token'
        const name = isToken
          ? getTokenName(
              tokenNames[row.token.address.toLowerCase()] ??
                row.token.symbol.replace(/on$/, '')
            )
          : (row.group.native?.name ?? row.key)
        const symbol = isToken
          ? formatExchangeSymbol(row.token.symbol, row.exchange)
          : `$${row.group.native?.symbol ?? row.key}`
        const logo = isToken ? (
          <MobileTokenLogo
            symbol={row.token.symbol}
            address={row.token.address}
            chain={chainId}
          />
        ) : (
          <MobileTokenLogo
            symbol={row.group.native?.symbol ?? row.key}
            address={row.group.tokens[0]?.address}
            chain={chainId}
            src={row.group.native?.logo}
          />
        )
        const marketCap =
          isToken && marketCaps?.[row.token.address.toLowerCase()]
            ? formatMarketCap(marketCaps[row.token.address.toLowerCase()])
            : !isToken && row.group.native?.coingeckoId
              ? marketCaps?.[row.group.native.coingeckoId]
                ? formatMarketCap(marketCaps[row.group.native.coingeckoId])
                : undefined
              : !isToken &&
                  marketCaps?.[row.group.tokens[0]?.address.toLowerCase()]
                ? formatMarketCap(
                    marketCaps[row.group.tokens[0]?.address.toLowerCase()]
                  )
                : undefined

        return (
          <div
            key={row.key}
            className="border-b border-border py-5 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-4 pr-5">
              <div className="min-w-0">
                <div className="break-words text-base font-medium">{name}</div>
              </div>
              <div className="shrink-0 text-right text-base font-medium text-primary dark:text-foreground">
                {row.weight.toFixed(2)}%
              </div>
            </div>
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,max-content)_minmax(0,max-content)] items-start gap-x-4 pr-5">
              <div className="min-w-0">
                <div className="text-xs leading-none text-muted-foreground">
                  <Trans>Symbol</Trans>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <div className="shrink-0 [&_img]:h-4 [&_img]:w-4">{logo}</div>
                  <span className="min-w-0 truncate">{symbol}</span>
                  {!isToken && row.group.tokens.length > 1 && (
                    <span className="shrink-0 text-xs font-normal text-muted-foreground">
                      <Plural
                        value={row.group.tokens.length}
                        one="(# source)"
                        other="(# sources)"
                      />
                    </span>
                  )}
                </div>
              </div>
              <div className="min-w-0 text-right">
                <div className="text-xs leading-none text-muted-foreground">
                  <Trans>Price Change ({TIME_RANGE_LABELS[timeRange]})</Trans>
                </div>
                <div className="mt-1.5 text-sm font-medium">
                  <PerformanceCell
                    change={row.change ?? null}
                    isLoading={performanceLoading}
                    isNewlyAdded={row.group.hasNewlyAdded || false}
                    timeRange={timeRange}
                  />
                </div>
              </div>
              <div className="min-w-0 text-right">
                <div className="text-xs leading-none text-muted-foreground">
                  <Trans>Market Cap</Trans>
                </div>
                <div className="mt-1.5 truncate text-sm font-medium text-muted-foreground">
                  {marketCap ?? '—'}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
