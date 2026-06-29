import { TableBody } from '@/components/ui/table'
import { Token, TimeRange } from '@/types'
import { BasketSkeleton } from './basket-skeleton'
import { ExposureTableRows } from './exposure-table-rows'
import { CollateralTableRows } from './collateral-table-rows'
import { ExposureRow } from './exposure-rows'
import { cn } from '@/lib/utils'

interface BasketTableBodyProps {
  filtered: Token[] | undefined
  isExposure: boolean
  exposureRows: ExposureRow[] | null
  basketShares: Record<string, string>
  basketPerformanceChanges: Record<string, number | null>
  performanceLoading: boolean
  newlyAddedAssets: Record<string, boolean>
  timeRange: TimeRange
  marketCaps: Record<string, number> | undefined
  chainId: number
  viewAll: boolean
  maxTokens: number
  hasFooterButton: boolean
}

export const BasketTableBody = ({
  filtered,
  isExposure,
  exposureRows,
  basketShares,
  basketPerformanceChanges,
  performanceLoading,
  newlyAddedAssets,
  timeRange,
  marketCaps,
  chainId,
  viewAll,
  maxTokens,
  hasFooterButton,
}: BasketTableBodyProps) => {
  const bodyClassName = cn(
    '[&_tr:first-child_td]:pt-6',
    !hasFooterButton && '[&_tr:last-child_td]:pb-0'
  )

  if (isExposure && !exposureRows?.length) {
    return (
      <TableBody className={bodyClassName}>
        <BasketSkeleton isExposure={isExposure} />
      </TableBody>
    )
  }

  if (!isExposure && !filtered?.length) {
    return (
      <TableBody className={bodyClassName}>
        <BasketSkeleton isExposure={isExposure} />
      </TableBody>
    )
  }

  if (isExposure && exposureRows) {
    return (
      <TableBody className={bodyClassName}>
        <ExposureTableRows
          rows={exposureRows}
          performanceLoading={performanceLoading}
          timeRange={timeRange}
          marketCaps={marketCaps}
          viewAll={viewAll}
          maxTokens={maxTokens}
        />
      </TableBody>
    )
  }

  if (!filtered?.length) return null

  return (
    <TableBody className={bodyClassName}>
      <CollateralTableRows
        filtered={filtered}
        basketShares={basketShares}
        basketPerformanceChanges={basketPerformanceChanges}
        performanceLoading={performanceLoading}
        newlyAddedAssets={newlyAddedAssets}
        timeRange={timeRange}
        chainId={chainId}
        viewAll={viewAll}
        maxTokens={maxTokens}
      />
    </TableBody>
  )
}
