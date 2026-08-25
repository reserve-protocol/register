import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/button'
import { cn } from '@/lib/utils'
import { getPaginationPages } from '@/components/ui/pagination-pages'
import { useIsMobile } from '@/hooks/use-media-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

export interface PaginationProps {
  currentPage: number
  pageCount: number
  visibleCount: number
  totalCount: number
  onPageChange: (page: number) => void
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
  className?: string
}

export const Pagination = ({
  className,
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageCount,
  pageSize,
  pageSizeOptions,
  totalCount,
  visibleCount,
}: PaginationProps) => {
  const isMobile = useIsMobile()
  const pages = getPaginationPages(pageCount, currentPage, isMobile ? 5 : 7)
  const canChangePageSize =
    pageSize !== undefined &&
    pageSizeOptions !== undefined &&
    pageSizeOptions.length > 0 &&
    onPageSizeChange !== undefined

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-between', className)}
    >
      <div className="hidden items-center gap-2 text-sm font-light text-muted-foreground md:flex">
        <span>
          Showing {visibleCount} out of {totalCount}
        </span>
        {canChangePageSize ? (
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger
              size="compact"
              className="w-[76px]"
              aria-label="Rows per page"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      <div className="grid w-full grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-2 md:w-auto md:grid-cols-[2rem_auto_2rem]">
        <Button
          aria-label="Previous page"
          size="compact"
          tone="quiet"
          className="w-8 justify-self-start px-0"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Button>

        <div className="flex items-center justify-self-center gap-1.5 sm:gap-2">
          {pages.map((page) =>
            typeof page === 'string' ? (
              <span
                key={page}
                aria-hidden="true"
                className="px-1 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : page === currentPage ? (
              <span
                key={page}
                aria-current="page"
                aria-label={`Page ${page}, current page`}
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-muted px-0 text-sm font-medium text-foreground"
              >
                {page}
              </span>
            ) : (
              <Button
                key={page}
                aria-label={`Page ${page}`}
                size="compact"
                tone="quiet"
                className="min-w-8 px-0 text-muted-foreground hover:text-foreground"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )
          )}
        </div>

        <Button
          aria-label="Next page"
          size="compact"
          tone="quiet"
          className="w-8 justify-self-end px-0"
          disabled={currentPage >= pageCount}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </nav>
  )
}
