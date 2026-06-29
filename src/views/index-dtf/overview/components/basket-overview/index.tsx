import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useIsMobile } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useMemo, useState } from 'react'
import { BasketTableBody } from './basket-table-body'
import {
  BasketTableHeader,
  SortConfig,
  SortDirection,
  SortField,
} from './basket-table-header'
import { buildExposureRows } from './exposure-rows'
import { MobileCollateralRows } from './mobile-collateral-rows'
import { MobileExposureRows } from './mobile-exposure-rows'
import { useBasketOverviewData } from './use-basket-overview-data'

const MAX_TOKENS = 10

const DEFAULT_SORT: SortConfig = { field: 'weight', direction: 'desc' }

const IndexBasketOverview = () => {
  const isMobile = useIsMobile()
  const [viewAll, setViewAll] = useState(false)
  const [activeTab, setActiveTab] = useState<'exposure' | 'collateral'>(
    'exposure'
  )
  const [sortConfig, setSortConfig] = useState<SortConfig>(DEFAULT_SORT)
  const isExposure = activeTab === 'exposure'

  const {
    filtered,
    exposureGroups,
    basketShares,
    basketPerformanceChanges,
    performanceLoading,
    newlyAddedAssets,
    timeRange,
    chainId,
    marketCaps,
  } = useBasketOverviewData()

  const handleTabSwitch = (tab: 'exposure' | 'collateral') => {
    setActiveTab(tab)
    setSortConfig(DEFAULT_SORT)
    setViewAll(false)
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

  const sortedExposureRows = useMemo(() => {
    if (!exposureGroups || !isExposure) return null

    return buildExposureRows(exposureGroups).sort((a, b) => {
      if (sortConfig.field === 'weight') {
        return compareValues(a.weight, b.weight, sortConfig.direction)
      }
      return compareValues(a.change, b.change, sortConfig.direction)
    })
  }, [exposureGroups, isExposure, sortConfig])

  const activeCount = isExposure
    ? (sortedExposureRows?.length ?? 0)
    : (sortedFiltered?.length ?? 0)
  const limitRows = isMobile && !viewAll
  const showViewAll = isMobile && activeCount > MAX_TOKENS

  return (
    <div className="flex flex-col">
      <div className={cn('sm:px-6 sm:pt-6', !showViewAll && 'sm:pb-6')}>
        <Tabs defaultValue="exposure">
          <TabsList className="mx-2 mb-2 mt-2 flex h-10 w-[calc(100%-1rem)] rounded-[70px] p-0.5 sm:hidden">
            <TabsTrigger
              value="exposure"
              className="h-full flex-1 rounded-[60px] py-0 data-[state=active]:text-primary dark:data-[state=active]:text-foreground"
              onClick={() => handleTabSwitch('exposure')}
            >
              <Trans>Exposure</Trans>
            </TabsTrigger>
            <TabsTrigger
              value="collateral"
              className="h-full flex-1 rounded-[60px] py-0 data-[state=active]:text-primary dark:data-[state=active]:text-foreground"
              onClick={() => handleTabSwitch('collateral')}
            >
              <Trans context="DTF basket">Collateral</Trans>
            </TabsTrigger>
          </TabsList>
          {isExposure && sortedExposureRows ? (
            <MobileExposureRows
              rows={sortedExposureRows}
              performanceLoading={performanceLoading}
              timeRange={timeRange}
              marketCaps={marketCaps}
              viewAll={!limitRows}
              maxTokens={MAX_TOKENS}
            />
          ) : sortedFiltered ? (
            <MobileCollateralRows
              filtered={sortedFiltered}
              basketShares={basketShares}
              basketPerformanceChanges={basketPerformanceChanges}
              performanceLoading={performanceLoading}
              newlyAddedAssets={newlyAddedAssets}
              timeRange={timeRange}
              chainId={chainId}
              viewAll={!limitRows}
              maxTokens={MAX_TOKENS}
            />
          ) : null}
          <Table className="hidden sm:table">
            <BasketTableHeader
              isExposure={isExposure}
              setActiveTab={handleTabSwitch}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
            <BasketTableBody
              filtered={sortedFiltered}
              isExposure={isExposure}
              exposureRows={sortedExposureRows}
              basketShares={basketShares}
              basketPerformanceChanges={basketPerformanceChanges}
              performanceLoading={performanceLoading}
              newlyAddedAssets={newlyAddedAssets}
              timeRange={timeRange}
              marketCaps={marketCaps}
              chainId={chainId}
              viewAll={!limitRows}
              maxTokens={MAX_TOKENS}
              hasFooterButton={showViewAll}
            />
          </Table>
        </Tabs>
      </div>
      {showViewAll && (
        <div className="px-2 pb-2 pt-3">
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => setViewAll(!viewAll)}
          >
            {viewAll
              ? t`View less`
              : isExposure
                ? t`View all ${activeCount} assets`
                : t`View all ${activeCount} tokens`}
          </Button>
        </div>
      )}
    </div>
  )
}

export { IndexBasketOverview as IndexBasketOverviewInner }

export default () => (
  <Card className="pb-0 sm:pb-0 group/section !bg-background" id="basket">
    <IndexBasketOverview />
  </Card>
)
