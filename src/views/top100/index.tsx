import useTrackPage from '@/hooks/useTrackPage'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Globe } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTop100List } from './hooks/use-top100-list'
import useTop100Filtered from './hooks/use-top100-filtered'
import Top100Filters from './components/top100-filters'
import Top100Table from './components/top100-table'
import Top100Card from './components/top100-card'

const Top100 = () => {
  useTrackPage('top100')
  const { dtfs, isLoading } = useTop100List()
  const data = useTop100Filtered(dtfs)

  return (
    <div className="container flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between ml-5 mr-2">
        <div>
          <h1 className="text-2xl font-bold">Top 100 DTFs</h1>
          <p className="text-legend text-sm mt-1">Community created DTFs</p>
        </div>
        <Button asChild variant="outline-primary" className="rounded-xl">
          <Link to="/deploy-index">
            Create yours <Globe className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-1 p-1 rounded-4xl bg-secondary">
        <Top100Filters />
        <div className="overflow-auto hidden lg:block">
          <Top100Table data={data} isLoading={isLoading} />
        </div>
        <div className="lg:hidden flex flex-col gap-1">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-[124px] rounded-3xl" />
              ))
            : data.length > 0
              ? data.map((dtf) => (
                  <Top100Card key={dtf.address} dtf={dtf} />
                ))
              : (
                <div className="flex items-center justify-center h-48 bg-card rounded-3xl">
                  <p className="text-muted-foreground">No DTFs found</p>
                </div>
              )}
        </div>
      </div>
    </div>
  )
}

export default Top100
