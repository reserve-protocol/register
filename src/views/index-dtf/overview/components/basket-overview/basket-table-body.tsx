import { TableBody } from '@/components/ui/table'
import { Token } from '@/types'
import { BasketSkeleton } from './basket-skeleton'
import { ExposureTableRows } from './exposure-table-rows'
import { CollateralTableRows } from './collateral-table-rows'

interface BasketTableBodyProps {
  filtered: Token[] | undefined
  isExposure: boolean
  exposureGroups: Map<string, any> | null
  basketShares: Record<string, string>
  basket7dChanges: Record<string, number | null>
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
  basket7dChanges,
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
        basket7dChanges={basket7dChanges}
        chainId={chainId}
        viewAll={viewAll}
        maxTokens={maxTokens}
        onCopyAddress={onCopyAddress}
      />
    </TableBody>
  )
}