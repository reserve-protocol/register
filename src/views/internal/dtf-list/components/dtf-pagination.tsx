import { useAtom, useAtomValue } from 'jotai'
import {
  currentPageAtom,
  pageSizeAtom,
  totalPagesAtom,
  totalCountAtom,
  isLoadingAtom
} from '../atoms'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DTFPagination = () => {
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom)
  const [pageSize, setPageSize] = useAtom(pageSizeAtom)
  const totalPages = useAtomValue(totalPagesAtom)
  const totalCount = useAtomValue(totalCountAtom)
  const isLoading = useAtomValue(isLoadingAtom)
  
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }
  
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }
  
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(0) // Reset to first page when page size changes
  }
  
  const handlePageJump = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page)
    }
  }
  
  // Calculate displayed item range
  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalCount)
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Showing {startItem} to {endItem} of {totalCount} DTFs
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm text-muted-foreground">
            Items per page:
          </label>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
            disabled={isLoading}
          >
            <SelectTrigger id="page-size" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousPage}
            disabled={currentPage === 0 || isLoading}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1 mx-1">
            {/* Show first page */}
            {currentPage > 2 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageJump(0)}
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  1
                </Button>
                {currentPage > 3 && (
                  <span className="text-muted-foreground">...</span>
                )}
              </>
            )}
            
            {/* Show pages around current page */}
            {Array.from({ length: totalPages }, (_, i) => i)
              .filter(page => {
                const distance = Math.abs(page - currentPage)
                return distance <= 2
              })
              .map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageJump(page)}
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  {page + 1}
                </Button>
              ))}
            
            {/* Show last page */}
            {currentPage < totalPages - 3 && (
              <>
                {currentPage < totalPages - 4 && (
                  <span className="text-muted-foreground">...</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageJump(totalPages - 1)}
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1 || isLoading}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DTFPagination