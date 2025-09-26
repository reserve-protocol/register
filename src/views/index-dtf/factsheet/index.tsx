import { Button } from '@/components/ui/button'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { factsheetTimeRangeAtom } from './atoms'
import FactsheetChart from './components/factsheet-chart'
import NetPerformanceSummary from './components/net-performance-summary'
import PerformanceTable from './components/performance-table'
import { useFactsheetData } from './hooks/use-factsheet-data'
import type { TimeRange } from './mocks/factsheet-data'

const Header = () => {
  const navigate = useNavigate()
  const dtf = useAtomValue(indexDTFAtom)

  const handleBack = () => {
    navigate(-1)
  }
  return (
    <div className="flex items-center gap-2.5 pb-6 sm:px-5">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="shrink-0 w-8 h-8 rounded-full bg-muted"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
      </Button>
      <h1 className="hidden sm:block text-2xl font-light">
        {dtf?.token?.name || 'Index DTF'} Fact Sheet
      </h1>
      <h1 className="sm:hidden text-xl font-light">
        {dtf?.token?.symbol || 'Index DTF'} Fact Sheet
      </h1>
    </div>
  )
}

const IndexDTFFactsheet = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const timeRange = useAtomValue(factsheetTimeRangeAtom)

  const prefetchRanges = useMemo(() => {
    const allRanges: TimeRange[] = ['24h', '7d', '1m', '3m', '1y', 'all']
    return allRanges.filter((r) => r !== timeRange)
  }, [timeRange])

  const { data, isLoading } = useFactsheetData({
    address: dtf?.id,
    timeRange,
    prefetchRanges,
  })

  return (
    <div className="container mx-auto px-4 py-6 max-w-full">
      <Header />

      <div className="flex flex-col gap-1 bg-secondary rounded-4xl">
        {/* Desktop */}
        <div className="hidden lg:block">
          <div className="bg-[#000] dark:bg-background rounded-3xl p-6">
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2">
                <FactsheetChart data={data} isLoading={isLoading} />
              </div>
              <div className="col-span-1 flex items-end">
                <PerformanceTable
                  performance={
                    data?.performance || {
                      '3m': null,
                      '6m': null,
                      ytd: null,
                      '1y': null,
                      all: null,
                    }
                  }
                  inception={data?.inception || Date.now() / 1000}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <div>
            <FactsheetChart data={data} isLoading={isLoading} />
          </div>
          <div className="bg-[#000] dark:bg-background rounded-3xl p-4">
            <PerformanceTable
              performance={
                data?.performance || {
                  '3m': null,
                  '6m': null,
                  ytd: null,
                  '1y': null,
                  all: null,
                }
              }
              inception={data?.inception || Date.now() / 1000}
            />
          </div>
        </div>

        {data?.netPerformance && (
          <NetPerformanceSummary data={data.netPerformance} />
        )}
      </div>
    </div>
  )
}

export default IndexDTFFactsheet
