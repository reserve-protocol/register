import TokenLogo from '@/components/token-logo'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatMarketCap } from '@/hooks/use-native-token-market-caps'

interface ExposureTableRowsProps {
  exposureGroups: Map<string, any>
  marketCaps: Record<string, number> | undefined
  viewAll: boolean
  maxTokens: number
}

export const ExposureTableRows = ({
  exposureGroups,
  marketCaps,
  viewAll,
  maxTokens,
}: ExposureTableRowsProps) => {
  return (
    <>
      {Array.from(exposureGroups.entries())
        .slice(0, viewAll ? exposureGroups.size : maxTokens)
        .map(([key, group]) => {
          const native = group.native || {
            symbol: key,
            name: key,
            logo: '',
          }
          return (
            <TableRow key={native.symbol} className="border-none">
              <TableCell>
                <div className="flex items-center font-semibold gap-3 break-words">
                  <TokenLogo size="lg" src={native.logo} />
                  <div className="max-w-32 md:max-w-72 lg:max-w-56">
                    <span className="block">{native.name}</span>
                    <span className="block text-xs text-legend font-normal max-w-32 md:max-w-72 lg:max-w-52 break-words">
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
              <TableCell className="text-center">
                {marketCaps?.[group.native?.coingeckoId] ? (
                  <span>
                    {formatMarketCap(
                      marketCaps[group.native.coingeckoId]
                    )}
                  </span>
                ) : (
                  <span>—</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {group.weightedChange !== undefined ? (
                  <span
                    className={
                      group.weightedChange < 0 ? 'text-legend' : ''
                    }
                  >
                    {group.weightedChange > 0 ? '+' : ''}
                    {(group.weightedChange * 100).toFixed(2)}%
                  </span>
                ) : (
                  <span>—</span>
                )}
              </TableCell>
              <TableCell className="text-right text-primary font-bold">
                {group.totalWeight.toFixed(2)}%
              </TableCell>
            </TableRow>
          )
        })}
    </>
  )
}