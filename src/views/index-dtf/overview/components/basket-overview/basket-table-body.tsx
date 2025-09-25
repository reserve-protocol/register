import { TableBody } from '@/components/ui/table'
import { Token, TimeRange } from '@/types'
import { BasketSkeleton } from './basket-skeleton'
import { ExposureTableRows } from './exposure-table-rows'
import { CollateralTableRows } from './collateral-table-rows'
import type { ExposureGroup } from './exposure-table-rows'

interface BasketTableBodyProps {
  filtered: Token[] | undefined
  isExposure: boolean
  exposureGroups: Map<string, ExposureGroup> | null | Array<[string, ExposureGroup]>
  basketShares: Record<string, string>
  basketPerformanceChanges: Record<string, number | null>
  performanceLoading: boolean
  newlyAddedAssets: Record<string, boolean>
  timeRange: TimeRange
  marketCaps: Record<string, number> | undefined
  chainId: number
  viewAll: boolean
  maxTokens: number
  onCopyAddress: (address: string) => void
}

export const BasketTableBody = ({
  filtered,
  isExposure,
  exposureGroups,
  basketShares,
  basketPerformanceChanges,
  performanceLoading,
  newlyAddedAssets,
  timeRange,
  marketCaps,
  chainId,
  viewAll,
  maxTokens,
  onCopyAddress,
}: BasketTableBodyProps) => {
  // Loading state - show skeleton
  if (!filtered?.length) {
    return (
      <TableBody>
        <BasketSkeleton isExposure={isExposure} />
      </TableBody>
    )
  }

  // Exposure view with grouped assets
  if (isExposure && exposureGroups) {
    return (
      <TableBody>
        <ExposureTableRows
          exposureGroups={exposureGroups}
          performanceLoading={performanceLoading}
          timeRange={timeRange}
          marketCaps={marketCaps}
          viewAll={viewAll}
          maxTokens={maxTokens}
        />
      </TableBody>
    )
  }

  // Collateral view with individual tokens
  return (
    <TableBody>
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
        onCopyAddress={onCopyAddress}
      />
    </TableBody>
  )
}