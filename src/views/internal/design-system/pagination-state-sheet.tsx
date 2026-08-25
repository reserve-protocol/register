import { useState } from 'react'

import { Pagination } from '@/components/design-system-v1/pagination'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { cn } from '@/lib/utils'

const PaginationStateSheet = () => {
  const [page, setPage] = useState(6)
  const [pageSize, setPageSize] = useState(10)

  return (
    <section data-testid="pagination-state-sheet" className="space-y-5">
      <div>
        <p className="text-sm font-medium text-primary">
          Accepted current baseline
        </p>
        <h2 className="mt-1 text-xl font-medium">
          Table-independent pagination
        </h2>
        <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
          This candidate builds from the approved DataTable page window while
          aligning all peers to the compact control scale and replacing
          stretched mobile actions with fixed edge controls and a smaller page
          window. Pagination owns the row, not its host's outer inset. Page-size
          selection remains optional and DataTable defaults remain unchanged.
        </p>
      </div>
      <div className="overflow-x-auto border border-border bg-card">
        <div
          className={cn('min-w-[320px]', v1LayoutRecipes.inset.ordinaryContent)}
        >
          <Pagination
            currentPage={page}
            pageCount={12}
            visibleCount={pageSize}
            totalCount={112}
            onPageChange={setPage}
            pageSize={pageSize}
            pageSizeOptions={[10, 25, 50]}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>
    </section>
  )
}

export default PaginationStateSheet
