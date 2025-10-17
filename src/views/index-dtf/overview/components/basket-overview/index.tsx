import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useScrollTo from '@/hooks/useScrollTo'
import { cn } from '@/lib/utils'
import { performanceTimeRangeAtom } from '@/state/dtf/atoms'
import { capitalize } from '@/utils/constants'
import { ETHERSCAN_NAMES } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  PackageOpen,
  Target,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BasketTableBody } from './basket-table-body'
import { useBasketOverviewData } from './use-basket-overview-data'

const MAX_TOKENS = 10

type SortField = 'weight' | 'performance'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

// Reusable sortable table header component
const TableHeaderWithSort = ({
  field,
  sortConfig,
  onSort,
  children,
  className = '',
}: {
  field: SortField
  sortConfig: SortConfig
  onSort: (field: SortField) => void
  children: React.ReactNode
  className?: string
}) => {
  const isActive = sortConfig.field === field
  const isDesc = isActive && sortConfig.direction === 'desc'
  const isAsc = isActive && sortConfig.direction === 'asc'

  return (
    <TableHead className={className}>
      <button
        onClick={() => onSort(field)}
        className={cn(
          'inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer text-xs sm:text-base',
          isActive && 'text-primary',
          className.includes('text-right') && 'ml-auto'
        )}
      >
        {children}
        {isDesc ? (
          <ArrowDown className="h-3 w-3" />
        ) : isAsc ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </button>
    </TableHead>
  )
}

const BasketTableHeader = ({
  isBSC,
  isExposure,
  hasBridgedAssets,
  chainId,
  setActiveTab,
  sortConfig,
  onSort,
}: {
  isBSC: boolean
  isExposure: boolean
  hasBridgedAssets: boolean
  chainId: number
  setActiveTab: (tab: 'exposure' | 'collateral') => void
  sortConfig: SortConfig
  onSort: (field: SortField) => void
}) => {
  const timeRange = useAtomValue(performanceTimeRangeAtom)

  const periodLabel = {
    '24h': '1d',
    '7d': '7d',
    '1m': '30d',
    '3m': '90d',
    '1y': '1y',
    all: 'All',
  }

  return (
    <TableHeader>
      <TableRow className="border-none text-legend bg-card sticky -top-[1px]">
        <TableHead className="text-left text-xs sm:text-base py-1">
          {isBSC ? (
            <TabsList className="h-9 rounded-[70px] p-0.5">
              <TabsTrigger
                value="exposure"
                className="rounded-[60px] px-2 data-[state=active]:text-primary"
                onClick={() => setActiveTab('exposure')}
              >
                <Target className="w-4 h-4 mr-0 sm:mr-1" />{' '}
                <span className="hidden sm:block">Exposure</span>
              </TabsTrigger>
              <TabsTrigger
                value="collateral"
                className="rounded-[60px] px-2 data-[state=active]:text-primary"
                onClick={() => setActiveTab('collateral')}
              >
                <PackageOpen className="w-4 h-4 mr-0 sm:mr-1" />{' '}
                <span className="hidden sm:block">Collateral</span>
              </TabsTrigger>
            </TabsList>
          ) : (
            'Token'
          )}
        </TableHead>
        {!isExposure && (
          <TableHeaderWithSort
            field="weight"
            sortConfig={sortConfig}
            onSort={onSort}
            className="text-center px-1 sm:px-3"
          >
            Weight
          </TableHeaderWithSort>
        )}
        {isExposure && (
          <TableHead className="text-center hidden sm:table-cell">
            <span className="text-xs sm:text-base">Market Cap</span>
          </TableHead>
        )}
        <TableHeaderWithSort
          field="performance"
          sortConfig={sortConfig}
          onSort={onSort}
          className="text-center px-1 sm:px-3"
        >
          {periodLabel[timeRange]} Change
        </TableHeaderWithSort>
        {isExposure && (
          <TableHeaderWithSort
            field="weight"
            sortConfig={sortConfig}
            onSort={onSort}
            className="text-right px-1 sm:px-3"
          >
            Weight
          </TableHeaderWithSort>
        )}
        <TableHead
          className={cn(
            'text-right text-xs sm:text-base px-1 sm:px-3',
            isExposure && 'hidden'
          )}
        >
          {`${hasBridgedAssets ? 'Bridge / ' : ''}${capitalize(
            ETHERSCAN_NAMES[chainId]
          )}`}
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

const IndexBasketOverview = () => {
  const [viewAll, setViewAll] = useState(false)
  const [activeTab, setActiveTab] = useState<'exposure' | 'collateral'>(
    'collateral'
  )
  // Default sort: highest weight first
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'weight',
    direction: 'desc',
  })
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
    isBSC,
  } = useBasketOverviewData(isExposure)

  // Update active tab when chain changes
  useEffect(() => {
    if (isBSC) {
      setActiveTab('exposure')
    } else {
      setActiveTab('collateral')
    }
    // Reset to default sort when switching views
    setSortConfig({ field: 'weight', direction: 'desc' })
  }, [isBSC])

  // Handle scroll to basket on hash change
  useEffect(() => {
    const section = window.location.hash.slice(1)
    if (section === 'basket' && basket?.length) {
      setTimeout(() => {
        scrollTo()
      }, 100)
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

  // Helper function for comparing values with null/undefined handling
  const compareValues = (
    aValue: number | null | undefined,
    bValue: number | null | undefined,
    direction: SortDirection
  ): number => {
    // Handle null/undefined - always put at the end regardless of sort direction
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1

    return direction === 'desc' ? bValue - aValue : aValue - bValue
  }

  // Sort collateral tokens
  const sortedFiltered = useMemo(() => {
    if (!filtered || isExposure) return filtered

    return [...filtered].sort((a, b) => {
      if (sortConfig.field === 'weight') {
        const aWeight = parseFloat(basketShares[a.address] || '0')
        const bWeight = parseFloat(basketShares[b.address] || '0')
        return compareValues(aWeight, bWeight, sortConfig.direction)
      } else {
        // performance
        return compareValues(
          basketPerformanceChanges[a.address],
          basketPerformanceChanges[b.address],
          sortConfig.direction
        )
      }
    })
  }, [filtered, isExposure, sortConfig, basketShares, basketPerformanceChanges])

  // Sort exposure groups
  const sortedExposureGroups = useMemo(() => {
    if (!exposureGroups || !isExposure) return exposureGroups

    const entries = Array.isArray(exposureGroups)
      ? exposureGroups
      : Array.from(exposureGroups.entries())
    return entries.sort(([, aGroup], [, bGroup]) => {
      if (sortConfig.field === 'weight') {
        return compareValues(
          aGroup.totalWeight || 0,
          bGroup.totalWeight || 0,
          sortConfig.direction
        )
      } else {
        // performance
        return compareValues(aGroup.change, bGroup.change, sortConfig.direction)
      }
    })
  }, [exposureGroups, isExposure, sortConfig])

  return (
    <div className="relative -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 px-1" id="basket">
      <Tabs defaultValue="exposure">
        <Table>
          <BasketTableHeader
            isBSC={isBSC}
            isExposure={isExposure}
            hasBridgedAssets={hasBridgedAssets || false}
            chainId={chainId}
            setActiveTab={setActiveTab}
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
      {((sortedFiltered && sortedFiltered.length > MAX_TOKENS) ||
        (sortedExposureGroups &&
          Array.isArray(sortedExposureGroups) &&
          sortedExposureGroups.length > MAX_TOKENS)) && (
        <Button
          variant="outline"
          className="w-full rounded-2xl"
          onClick={() => setViewAll(!viewAll)}
        >
          {viewAll
            ? 'View less'
            : `View all ${
                isExposure
                  ? Array.isArray(sortedExposureGroups)
                    ? sortedExposureGroups.length
                    : 0
                  : sortedFiltered?.length || 0
              } ${isExposure ? 'assets' : 'tokens'}`}
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
