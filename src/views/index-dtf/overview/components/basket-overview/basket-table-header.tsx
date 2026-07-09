import { TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { performanceTimeRangeAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Trans } from '@lingui/react/macro'

export type SortField = 'weight' | 'performance'
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

export const TIME_RANGE_LABELS = {
  '24h': '1d',
  '7d': '7d',
  '1m': '30d',
  '3m': '90d',
  ytd: 'YTD',
  '1y': '1y',
  all: 'All',
} as const

const TableHeaderWithSort = ({
  field,
  sortConfig,
  onSort,
  children,
  className = '',
  buttonClassName,
}: {
  field: SortField
  sortConfig: SortConfig
  onSort: (field: SortField) => void
  children: React.ReactNode
  className?: string
  buttonClassName?: string
}) => {
  const isActive = sortConfig.field === field
  const isDesc = isActive && sortConfig.direction === 'desc'
  const isAsc = isActive && sortConfig.direction === 'asc'
  const isRightAligned = className.includes('text-right')

  return (
    <TableHead className={className}>
      <button
        onClick={() => onSort(field)}
        className={cn(
          'inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer text-xs sm:text-sm',
          isActive && 'text-primary',
          isRightAligned && 'ml-auto w-full justify-end',
          buttonClassName
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
  setActiveTab,
  sortConfig,
  onSort,
}: {
  isExposure: boolean
  setActiveTab: (tab: 'exposure' | 'collateral') => void
  sortConfig: SortConfig
  onSort: (field: SortField) => void
}) => {
  const timeRange = useAtomValue(performanceTimeRangeAtom)

  return (
    <TableHeader>
      <TableRow className="border-none bg-card text-legend hover:bg-transparent">
        <TableHead className="h-auto w-1/2 py-0 pl-0 pr-2 text-left text-xs sm:text-sm">
          <TabsList className="hidden h-7 rounded-[70px] px-0.5 py-0 sm:inline-flex sm:h-8">
            <TabsTrigger
              value="exposure"
              className="rounded-[60px] px-3 data-[state=active]:text-primary dark:data-[state=active]:text-foreground"
              onClick={() => setActiveTab('exposure')}
            >
              <span>
                <Trans>Exposure</Trans>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="collateral"
              className="rounded-[60px] px-3 data-[state=active]:text-primary dark:data-[state=active]:text-foreground"
              onClick={() => setActiveTab('collateral')}
            >
              <span>
                <Trans context="DTF basket">Collateral</Trans>
              </span>
            </TabsTrigger>
          </TabsList>
        </TableHead>

        <TableHeaderWithSort
          field="weight"
          sortConfig={sortConfig}
          onSort={onSort}
          className={
            isExposure
              ? 'h-auto w-20 whitespace-nowrap py-0 pl-2 pr-0 text-right'
              : 'h-auto w-16 whitespace-nowrap py-0 pl-2 pr-0 text-right'
          }
          buttonClassName="dark:text-foreground"
        >
          <Trans>Weight</Trans>
        </TableHeaderWithSort>

        <TableHeaderWithSort
          field="performance"
          sortConfig={sortConfig}
          onSort={onSort}
          className={
            isExposure
              ? 'h-auto w-28 py-0 pl-2 pr-0 text-right text-wrap sm:text-nowrap'
              : 'h-auto w-28 whitespace-nowrap py-0 pl-3 pr-0 text-right'
          }
        >
          <Trans>Price Change ({TIME_RANGE_LABELS[timeRange]})</Trans>
        </TableHeaderWithSort>

        <TableHead className="hidden h-auto w-28 whitespace-nowrap py-0 pl-2 pr-0 text-right sm:table-cell">
          <span className="text-xs sm:text-sm">
            <Trans>Market Cap</Trans>
          </span>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}
