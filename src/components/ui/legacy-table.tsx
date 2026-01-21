/**
 * Legacy Table wrapper - maintains backward compatibility with old Table API
 * Uses DataTable internally with shadcn/tailwind styling
 */
import {
  SortingState,
  Row,
  ColumnDef,
} from '@tanstack/react-table'
import DataTable, { SorteableButton } from './data-table'
import { cn } from '@/lib/utils'
import Skeleton from 'react-loading-skeleton'

// Legacy theme-ui spacing to Tailwind mapping
const spacingMap: Record<number, string> = {
  0: '0',
  1: '1', // 4px
  2: '2', // 8px
  3: '4', // 16px
  4: '6', // 24px
  5: '8', // 32px
}

export interface TableProps {
  columns: ColumnDef<any, any>[]
  data: any[]
  compact?: boolean
  sorting?: boolean
  pagination?: boolean | { pageSize: number }
  onSort?(state: SortingState): void
  defaultPageSize?: number
  onRowClick?(data: any, row: Row<any>): void
  sortBy?: SortingState
  maxHeight?: string | number
  isLoading?: boolean
  columnVisibility?: (string | string[])[]
  renderSubComponent?: (props: { row: Row<any> }) => React.ReactElement
  className?: string
  // theme-ui legacy props (converted to Tailwind classes)
  sx?: Record<string, unknown>
  mt?: number | string
  mb?: number | string
  pt?: number | string
  pb?: number | string
  p?: number | string
}

export function Table({
  columns,
  data = [],
  sorting = false,
  compact = false,
  pagination,
  isLoading = false,
  defaultPageSize = 10,
  maxHeight = 'auto',
  sortBy = [],
  onRowClick,
  renderSubComponent,
  className,
  mt,
  mb,
  pt,
  pb,
  p,
}: TableProps) {
  // Convert onRowClick signature from (data, row) to (data, event, row)
  const handleRowClick = onRowClick
    ? (rowData: any, event: React.MouseEvent, row?: Row<any>) => {
        onRowClick(rowData, row!)
      }
    : undefined

  // For pagination, map old API to new
  const paginationConfig = pagination
    ? typeof pagination === 'boolean'
      ? { pageSize: defaultPageSize }
      : pagination
    : undefined

  // Build spacing classes from legacy props
  const getSpacingClass = (prefix: string, value?: number | string) => {
    if (value === undefined) return ''
    const numValue = typeof value === 'string' ? parseInt(value) : value
    const twValue = spacingMap[numValue] ?? numValue
    return `${prefix}-${twValue}`
  }

  const spacingClasses = [
    getSpacingClass('mt', mt),
    getSpacingClass('mb', mb),
    getSpacingClass('pt', pt),
    getSpacingClass('pb', pb),
    getSpacingClass('p', p),
  ].filter(Boolean)

  return (
    <div className={cn(spacingClasses)}>
      <DataTable
        columns={columns}
        data={data}
        pagination={paginationConfig}
        onRowClick={handleRowClick}
        renderSubComponent={renderSubComponent}
        initialSorting={sortBy}
        loading={isLoading}
        className={cn(
          compact && '[&_td]:py-1 [&_th]:py-1',
          maxHeight !== 'auto' && `max-h-[${maxHeight}]`,
          className
        )}
        loadingSkeleton={
          <tr>
            <td colSpan={columns.length}>
              <Skeleton count={5} height={40} style={{ marginTop: 10 }} />
            </td>
          </tr>
        }
      />
    </div>
  )
}

// Re-export SorteableButton for consumers that use it
export { SorteableButton }
