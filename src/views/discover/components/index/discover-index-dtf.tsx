import { Skeleton } from '@/components/ui/skeleton'
import DTFFilters from './components/dtf-filters'
import IndexDTFCard from './components/index-dtf-card'
import IndexDTFTable from './components/index-dtf-table'
import useFilteredDTFIndex from './hooks/use-filtered-dtf-index'
import TitleContainer from '../title-container'
import IndexDTFFeatured from './components/index-dtf-featured'

const IndexDTFList = () => {
  const { data, isLoading } = useFilteredDTFIndex()

  if (isLoading) {
    return <Skeleton className="h-[500px] rounded-[20px]" />
  }

  return (
    <div className="flex flex-col gap-1 p-1 rounded-[20px] bg-secondary">
      <DTFFilters />
      <div className="overflow-auto">
        <IndexDTFTable data={data} />
      </div>

      <div className="lg:hidden bg-card rounded-[20px]">
        {data.map((dtf) => (
          <div key={dtf.address} className="[&:not(:last-child)]:border-b">
            <IndexDTFCard dtf={dtf} />
          </div>
        ))}
      </div>
    </div>
  )
}

const DiscoverIndexDTF = () => {
  return (
    <div className="mt-6">
      <TitleContainer title="Release Week DTFs" />
      <IndexDTFFeatured />
      <TitleContainer title="All Reserve Index DTFs" className="mt-10" />
      <IndexDTFList />
    </div>
  )
}

export default DiscoverIndexDTF
