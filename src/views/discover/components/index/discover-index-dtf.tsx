import { Skeleton } from '@/components/ui/skeleton'
import DTFFilters from './components/dtf-filters'
import IndexDTFCard from './components/index-dtf-card'
import IndexDTFTable from './components/index-dtf-table'
import useFilteredDTFIndex from './hooks/use-filtered-dtf-index'

const MobilePlaceholder = () => {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="bg-background flex rounded-3xl gap-3 p-3">
          <Skeleton className="h-[100px] w-[100px] rounded-xl flex-shrink-0" />
          <div className="border-l pl-3 flex flex-grow flex-col gap-2">
            <div className="flex items-center">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="ml-auto h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-5 w-[150px] mt-auto pt-2" />
            <div className="flex items-end text-xs">
              <div className="flex -space-x-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-5 w-5 rounded-full border-2 border-background"
                  />
                ))}
              </div>
              <Skeleton className="ml-auto h-4 w-[80px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const DiscoverIndexDTF = () => {
  const { data, isLoading } = useFilteredDTFIndex()

  return (
    <>
      <div className="flex flex-col gap-0.5 lg:gap-1 p-1 rounded-4xl bg-secondary">
        <DTFFilters />
        <div className="overflow-auto hidden lg:block">
          <IndexDTFTable data={data} isLoading={isLoading} />
        </div>

        <div className="lg:hidden flex flex-col gap-1">
          {isLoading ? (
            <MobilePlaceholder />
          ) : (
            data.map((dtf) => <IndexDTFCard key={dtf.address} dtf={dtf} />)
          )}
        </div>
      </div>
    </>
  )
}

export default DiscoverIndexDTF
