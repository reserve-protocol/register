import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useIsMobile } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BasketTableBody } from './basket-table-body'
import {
  BasketTableHeader,
  SortConfig,
  SortDirection,
  SortField,
} from './basket-table-header'
import { buildExposureRows } from './exposure-rows'
import { MobileBasketSkeleton } from './mobile-basket-skeleton'
import { MobileCollateralRows } from './mobile-collateral-rows'
import { MobileExposureRows } from './mobile-exposure-rows'
import { useBasketOverviewData } from './use-basket-overview-data'

const MAX_TOKENS = 10

const DEFAULT_SORT: SortConfig = { field: 'weight', direction: 'desc' }

const IndexBasketOverview = ({
  progressive = false,
}: {
  /**
   * Limit the table to the top rows with a "Show N more" expander on ALL
   * viewports, not just mobile (the default keeps desktop unlimited).
   */
  progressive?: boolean
}) => {
  const { t } = useLingui()
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
  const limitRows = (isMobile || progressive) && !viewAll
  const showViewAll = (isMobile || progressive) && activeCount > MAX_TOKENS
  // Desktop progressive mode swaps the footer button for a frosted shelf
  // (below); mobile keeps the standard button.
  const useShelf = progressive && !isMobile && showViewAll

  return (
    <div data-testid="overview-basket" className="relative flex flex-col">
      <div className={cn('sm:px-6 sm:pt-6', !showViewAll && 'sm:pb-6')}>
        <Tabs defaultValue="exposure">
          <div className="px-5 pb-2 pt-5 sm:hidden">
            <h2 className="text-2xl font-light">
              <Trans>Holdings</Trans>
            </h2>
          </div>
          <TabsList className="mx-2 mb-1 mt-2 flex h-10 w-[calc(100%-1rem)] rounded-[70px] p-0.5 sm:hidden">
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
          {isExposure ? (
            sortedExposureRows ? (
              <MobileExposureRows
                rows={sortedExposureRows}
                performanceLoading={performanceLoading}
                timeRange={timeRange}
                marketCaps={marketCaps}
                viewAll={!limitRows}
                maxTokens={MAX_TOKENS}
              />
            ) : (
              <MobileBasketSkeleton isExposure />
            )
          ) : sortedFiltered ? (
            <MobileCollateralRows
              filtered={sortedFiltered}
              basketShares={basketShares}
              basketPerformanceChanges={basketPerformanceChanges}
              performanceLoading={performanceLoading}
              newlyAddedAssets={newlyAddedAssets}
              timeRange={timeRange}
              marketCaps={marketCaps}
              chainId={chainId}
              viewAll={!limitRows}
              maxTokens={MAX_TOKENS}
            />
          ) : (
            <MobileBasketSkeleton />
          )}
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
      {useShelf ? (
        /* Expansion is one-way: once opened there's no collapse control —
           the full list is the resting state and a toggle there was jarring. */
        !viewAll && (
          /* Frosted shelf: the last visible rows diffuse into the card —
             a gradually-masked backdrop blur (same 7px frost as the app's
             floating nav) under an alpha gradient that resolves to the card
             background. The whole shelf is the expand affordance. */
          <button
            type="button"
            aria-label={t`Show ${activeCount - MAX_TOKENS} more`}
            onClick={() => setViewAll(true)}
            className="group absolute inset-x-0 bottom-0 h-32 rounded-b-4xl focus-visible:outline-none"
          >
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] backdrop-blur-[7px] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_70%)] [mask-image:linear-gradient(to_bottom,transparent,black_70%)]" />
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-transparent via-card/60 to-card" />
            <span className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              {t`Show ${activeCount - MAX_TOKENS} more`}
              <ChevronDown className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-y-0.5 motion-reduce:transition-none" />
            </span>
            <span className="absolute inset-x-6 bottom-2 hidden h-8 rounded-full ring-2 ring-ring group-focus-visible:block" />
          </button>
        )
      ) : (
        showViewAll && (
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
        )
      )}
    </div>
  )
}

export { IndexBasketOverview as IndexBasketOverviewInner }
