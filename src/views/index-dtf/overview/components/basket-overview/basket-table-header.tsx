import { TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { performanceTimeRangeAtom } from '@/state/dtf/atoms'
import { capitalize } from '@/utils/constants'
import { ETHERSCAN_NAMES } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowUp, ArrowUpDown, PackageOpen, Target } from 'lucide-react'
import SectionAnchor from '@/components/section-anchor'

export type SortField = 'weight' | 'performance'
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

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

export const BasketTableHeader = ({
  isExposure,
  hasBridgedAssets,
  chainId,
  setActiveTab,
  sortConfig,
  onSort,
}: {
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
          <SectionAnchor id="basket" />
        </TableHead>

        <TableHeaderWithSort
          field="weight"
          sortConfig={sortConfig}
          onSort={onSort}
          className="text-center px-1 sm:px-3"
        >
          Weight
        </TableHeaderWithSort>

        <TableHeaderWithSort
          field="performance"
          sortConfig={sortConfig}
          onSort={onSort}
          className="text-center px-1 sm:px-3"
        >
          Price Change ({periodLabel[timeRange]})
        </TableHeaderWithSort>

        {isExposure ? (
          <TableHead className="text-center hidden sm:table-cell">
            <span className="text-xs sm:text-base">Market Cap</span>
          </TableHead>
        ) : (
          <TableHead className="text-right text-xs sm:text-base px-1 sm:px-3">
            {`${hasBridgedAssets ? 'Bridge / ' : ''}${capitalize(
              ETHERSCAN_NAMES[chainId]
            )}`}
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  )
}
