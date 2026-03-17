import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table } from '@/components/ui/table'
import { Tabs } from '@/components/ui/tabs'
import useScrollTo from '@/hooks/useScrollTo'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BasketTableBody } from './basket-table-body'
import { BasketTableHeader, SortConfig, SortDirection, SortField } from './basket-table-header'
import { useBasketOverviewData } from './use-basket-overview-data'

const MAX_TOKENS = 10

const DEFAULT_SORT: SortConfig = { field: 'weight', direction: 'desc' }

const IndexBasketOverview = () => {
  const [viewAll, setViewAll] = useState(false)
  const [activeTab, setActiveTab] = useState<'exposure' | 'collateral'>(
    'exposure'
  )
  const [sortConfig, setSortConfig] = useState<SortConfig>(DEFAULT_SORT)
  const isExposure = activeTab === 'exposure'
  const scrollTo = useScrollTo('basket', 80)

  const {
    basket,
    filtered,
    exposureGroups,
    basketShares,
    basketPerformanceChanges,
    performanceLoading,
    newlyAddedAssets,
    timeRange,
    hasBridgedAssets,
    chainId,
    marketCaps,
  } = useBasketOverviewData()

  const handleTabSwitch = (tab: 'exposure' | 'collateral') => {
    setActiveTab(tab)
    setSortConfig(DEFAULT_SORT)
    setViewAll(false)
  }

  useEffect(() => {
    const section = window.location.hash.slice(1)
    if (section === 'basket' && basket?.length) {
      setTimeout(() => scrollTo(), 100)
    }
  }, [scrollTo, basket])

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success('Copied to clipboard')
  }

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  const compareValues = (
    aValue: number | null | undefined,
    bValue: number | null | undefined,
    direction: SortDirection
  ): number => {
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1
    return direction === 'desc' ? bValue - aValue : aValue - bValue
  }

  const sortedFiltered = useMemo(() => {
    if (!filtered || isExposure) return filtered

    return [...filtered].sort((a, b) => {
      if (sortConfig.field === 'weight') {
        const aWeight = parseFloat(basketShares[a.address] || '0')
        const bWeight = parseFloat(basketShares[b.address] || '0')
        return compareValues(aWeight, bWeight, sortConfig.direction)
      }
      return compareValues(
        basketPerformanceChanges[a.address],
        basketPerformanceChanges[b.address],
        sortConfig.direction
      )
    })
  }, [filtered, isExposure, sortConfig, basketShares, basketPerformanceChanges])

  const sortedExposureGroups = useMemo(() => {
    if (!exposureGroups || !isExposure) return exposureGroups

    return [...exposureGroups].sort(([, aGroup], [, bGroup]) => {
      if (sortConfig.field === 'weight') {
        return compareValues(
          aGroup.totalWeight || 0,
          bGroup.totalWeight || 0,
          sortConfig.direction
        )
      }
      return compareValues(aGroup.change, bGroup.change, sortConfig.direction)
    })
  }, [exposureGroups, isExposure, sortConfig])

  const activeCount = isExposure
    ? (sortedExposureGroups?.length ?? 0)
    : (sortedFiltered?.length ?? 0)
  const showViewAll = activeCount > MAX_TOKENS

  return (
    <div className="relative -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 px-1" id="basket">
      <Tabs defaultValue="exposure">
        <Table>
          <BasketTableHeader
            isExposure={isExposure}
            hasBridgedAssets={hasBridgedAssets || false}
            chainId={chainId}
            setActiveTab={handleTabSwitch}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
          <BasketTableBody
            filtered={sortedFiltered}
            isExposure={isExposure}
            exposureGroups={sortedExposureGroups}
            basketShares={basketShares}
            basketPerformanceChanges={basketPerformanceChanges}
            performanceLoading={performanceLoading}
            newlyAddedAssets={newlyAddedAssets}
            timeRange={timeRange}
            marketCaps={marketCaps}
            chainId={chainId}
            viewAll={viewAll}
            maxTokens={MAX_TOKENS}
            onCopyAddress={handleCopyAddress}
          />
        </Table>
      </Tabs>
      {showViewAll && (
        <Button
          variant="outline"
          className="w-full rounded-2xl"
          onClick={() => setViewAll(!viewAll)}
        >
          {viewAll
            ? 'View less'
            : `View all ${activeCount} ${isExposure ? 'assets' : 'tokens'}`}
        </Button>
      )}
    </div>
  )
}

export default () => (
  <Card className="pt-3 pb-5 sm:pt-4 sm:pb-6">
    <div className="px-4 sm:px-6">
      <IndexBasketOverview />
    </div>
  </Card>
)
