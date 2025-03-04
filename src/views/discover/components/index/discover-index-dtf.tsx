import { Skeleton } from '@/components/ui/skeleton'
import DTFFilters from './components/dtf-filters'
import IndexDTFCard from './components/index-dtf-card'
import IndexDTFTable from './components/index-dtf-table'
import useFilteredDTFIndex from './hooks/use-filtered-dtf-index'

const DiscoverIndexDTF = () => {
  const { data, isLoading } = useFilteredDTFIndex()

  if (isLoading) {
    return <Skeleton className="h-[500px] rounded-4xl bg-card" />
  }

  return (
    <div className="flex flex-col gap-1 p-1 rounded-4xl bg-secondary">
      <DTFFilters />
      <div className="overflow-auto">
        <IndexDTFTable data={data} />
      </div>

      <div className="lg:hidden flex flex-col gap-1">
        {data.map((dtf) => (
          <IndexDTFCard key={dtf.address} dtf={dtf} />
        ))}
      </div>
    </div>
  )
}

export default DiscoverIndexDTF
