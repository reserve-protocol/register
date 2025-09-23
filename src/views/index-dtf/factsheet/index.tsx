import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useMemo } from 'react'
import { useFactsheetData } from './hooks/use-factsheet-data'
import { factsheetTimeRangeAtom } from './atoms'
import FactsheetChart from './components/factsheet-chart'
import PerformanceTable from './components/performance-table'
import NetPerformanceSummary from './components/net-performance-summary'
import type { TimeRange } from './mocks/factsheet-data'

const IndexDTFFactsheet = () => {
  const navigate = useNavigate()
  const dtf = useAtomValue(indexDTFAtom)
  const timeRange = useAtomValue(factsheetTimeRangeAtom)

  // Build prefetch ranges for all other time ranges
  const prefetchRanges = useMemo(() => {
    const allRanges: TimeRange[] = ['24h', '7d', '1m', '3m', '1y', 'all']
    return allRanges.filter(r => r !== timeRange)
  }, [timeRange])

  const { data, isLoading } = useFactsheetData({
    address: dtf?.id,
    timeRange,
    prefetchRanges
  })

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">
          {dtf?.token?.name || 'Index DTF'} Fact Sheet
        </h1>
      </div>

      {/* Desktop Chart and Performance Section */}
      <div className="hidden lg:block mb-8">
        <div className="bg-[#000] dark:bg-background rounded-3xl p-6">
          <div className="grid grid-cols-3 gap-8">
            {/* Chart - Takes 2 columns */}
            <div className="col-span-2">
              <FactsheetChart data={data} isLoading={isLoading} />
            </div>
            {/* Performance Table - Takes 1 column */}
            <div className="col-span-1 flex items-end">
              <PerformanceTable
                performance={data?.performance || {
                  '3m': null,
                  '6m': null,
                  ytd: null,
                  '1y': null,
                  all: null
                }}
                inception={data?.inception || Date.now() / 1000}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Chart and Performance Section */}
      <div className="lg:hidden mb-8">
        {/* Chart */}
        <div className="mb-4">
          <FactsheetChart data={data} isLoading={isLoading} />
        </div>
        {/* Performance Table */}
        <div className="bg-[#000] dark:bg-background rounded-2xl p-4">
          <PerformanceTable
            performance={data?.performance || {
              '3m': null,
              '6m': null,
              ytd: null,
              '1y': null,
              all: null
            }}
            inception={data?.inception || Date.now() / 1000}
          />
        </div>
      </div>

      {/* Net Performance Summary Table */}
      {data?.netPerformance && (
        <NetPerformanceSummary data={data.netPerformance} />
      )}
    </div>
  )
}

export default IndexDTFFactsheet
