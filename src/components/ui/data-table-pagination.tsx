import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Trans } from '@lingui/react/macro'
import { Table as TableType } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

type PaginationPage = number | 'start-ellipsis' | 'end-ellipsis'

export const getPaginationPages = (
  pageCount: number,
  currentPage: number
): PaginationPage[] => {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'end-ellipsis', pageCount]
  }

  if (currentPage >= pageCount - 3) {
    return [
      1,
      'start-ellipsis',
      pageCount - 4,
      pageCount - 3,
      pageCount - 2,
      pageCount - 1,
      pageCount,
    ]
  }

  return [
    1,
    'start-ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'end-ellipsis',
    pageCount,
  ]
}

const usePaginationPages = <TData,>(table: TableType<TData>) => {
  const pageCount = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1

  return useMemo(
    () => ({
      currentPage,
      pages: getPaginationPages(pageCount, currentPage),
    }),
    [currentPage, pageCount]
  )
}

const paginationButtonClassName =
  'min-w-7 rounded-full bg-border/40 text-foreground hover:bg-border/70 disabled:bg-border/20 disabled:text-muted-foreground/50'

const pageButtonClassName =
  'min-w-7 flex-1 rounded-full text-muted-foreground hover:bg-border/40 hover:text-foreground md:flex-none'

export const DataTablePagination = <TData,>({
  table,
  showPageSizeSelector = false,
}: {
  table: TableType<TData>
  showPageSizeSelector?: boolean
}) => {
  const { currentPage, pages } = usePaginationPages(table)
  const filteredRowCount = table.getFilteredRowModel().rows.length
  const visibleRowCount = table.getRowModel().rows.length

  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-4 sm:px-6">
      <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
        <span>
          <Trans>
            Showing {visibleRowCount} out of {filteredRowCount}
          </Trans>
        </span>
        {showPageSizeSelector && (
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex w-full items-center justify-center md:w-auto">
        <div className="flex w-full items-center gap-1.5 sm:gap-2 md:w-auto">
          <Button
            variant="ghost"
            size="xs"
            className={cn(paginationButtonClassName, 'flex-1 md:flex-none')}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={16} />
          </Button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {pages.map((pageNumber) =>
              typeof pageNumber === 'string' ? (
                <span
                  key={pageNumber}
                  className="px-1 text-sm text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={pageNumber}
                  variant="ghost"
                  size="xs"
                  className={cn(
                    pageButtonClassName,
                    currentPage === pageNumber &&
                      'bg-border/50 font-medium text-foreground hover:bg-border/50'
                  )}
                  onClick={() => table.setPageIndex(pageNumber - 1)}
                >
                  {pageNumber}
                </Button>
              )
            )}
          </div>
          <Button
            variant="ghost"
            size="xs"
            className={cn(paginationButtonClassName, 'flex-1 md:flex-none')}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
