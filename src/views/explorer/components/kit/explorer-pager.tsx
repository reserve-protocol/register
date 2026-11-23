import { cn } from '@/lib/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { getPageRange, getPageWindow } from './page-window'

const arrowClassName =
  'flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted disabled:cursor-default disabled:text-legend disabled:hover:bg-card sm:h-9 sm:w-9'

const ExplorerPager = ({
  pageIndex,
  pageCount,
  pageSize,
  total,
  onPageChange,
  note,
}: {
  pageIndex: number
  pageCount: number
  pageSize: number
  total: number
  onPageChange: (pageIndex: number) => void
  note?: ReactNode
}) => {
  const { t } = useLingui()
  const { from, to } = getPageRange(pageIndex, pageSize, total)
  const page = pageIndex + 1
  const totalLabel = total.toLocaleString('en-US')

  return (
    <div
      className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-3 sm:px-6"
      data-testid="explorer-pager"
    >
      <span className="hidden text-sm text-legend sm:inline">
        <Trans>
          Showing {from}–{to} of {totalLabel}
        </Trans>
        {note && <> · {note}</>}
      </span>
      <nav
        aria-label={t`Pages`}
        className="flex w-full items-center justify-between gap-1 sm:ml-auto sm:w-auto sm:justify-end"
      >
        <button
          type="button"
          aria-label={t`Previous page`}
          disabled={pageIndex === 0}
          onClick={() => onPageChange(pageIndex - 1)}
          className={arrowClassName}
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
        <span className="text-sm text-legend sm:hidden">
          <Trans>
            Page {page} of {pageCount}
          </Trans>
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          {getPageWindow(page, pageCount).map((slot, index) =>
            slot === 'gap' ? (
              <span key={`gap-${index}`} className="px-1 text-legend" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={slot}
                type="button"
                aria-current={slot === page ? 'page' : undefined}
                onClick={() => onPageChange(slot - 1)}
                className={cn(
                  'h-9 min-w-9 rounded-full px-2 text-sm transition-colors hover:bg-muted',
                  slot === page &&
                    'bg-accent font-semibold text-primary hover:bg-accent'
                )}
              >
                {slot}
              </button>
            )
          )}
        </span>
        <button
          type="button"
          aria-label={t`Next page`}
          disabled={page >= pageCount}
          onClick={() => onPageChange(pageIndex + 1)}
          className={arrowClassName}
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </nav>
    </div>
  )
}

export default ExplorerPager
