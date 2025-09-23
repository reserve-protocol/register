import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon } from 'lucide-react'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import type { NetPerformanceYear } from '../mocks/factsheet-data'

interface NetPerformanceSummaryProps {
  data: NetPerformanceYear[]
}

const monthColumns = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const

const monthKeys = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
] as const

const formatPerformanceValue = (value: number | null): string => {
  if (value === null) return '-'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

const NetPerformanceSummary = ({ data }: NetPerformanceSummaryProps) => {
  const dtf = useAtomValue(indexDTFAtom)

  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = ['Year', ...monthColumns, 'FY/YTD']
    const rows = data.map(yearData => {
      const monthValues = monthKeys.map(key => {
        const value = yearData[key]?.value
        return value !== null ? value.toFixed(2) : ''
      })
      return [
        yearData.year,
        ...monthValues,
        yearData.yearToDate?.toFixed(2) || ''
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${dtf?.token?.symbol || 'DTF'}-net-performance.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="bg-white dark:bg-background border-secondary rounded-2xl p-4 md:p-6 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3">
        <h3 className="text-lg md:text-xl font-semibold">
          Net Performance Summary - {dtf?.token?.name || 'Index'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 text-primary hover:text-primary/80"
        >
          <DownloadIcon className="h-4 w-4" />
          <span className="hidden md:inline">Download CSV</span>
          <span className="md:hidden">Download as CSV</span>
        </Button>
      </div>

      {/* Mobile view - list format */}
      <div className="block md:hidden space-y-4">
        {data.map(yearData => (
          <div key={yearData.year} className="border-b pb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-base">{yearData.year}</span>
              <span className="text-sm text-muted-foreground">
                FY/YTD: {yearData.yearToDate !== null
                  ? formatPerformanceValue(yearData.yearToDate)
                  : '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {monthKeys.map((monthKey, idx) => {
                const monthData = yearData[monthKey]
                const value = monthData?.value
                return (
                  <div key={monthKey} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {monthColumns[idx]} - {yearData.year}
                    </span>
                    <span className={value !== null && value >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {value !== null ? formatPerformanceValue(value) : '-'}
                      {monthData?.isBest && (
                        <span className="text-green-600 ml-1">▲</span>
                      )}
                      {monthData?.isWorst && (
                        <span className="text-red-600 ml-1">▼</span>
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view - table format */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 font-medium text-xs"></th>
              {monthColumns.map(month => (
                <th key={month} className="text-center py-2 px-1 font-medium text-xs">
                  {month}
                </th>
              ))}
              <th className="text-center py-2 px-2 font-medium text-xs">FY/YTD</th>
            </tr>
          </thead>
          <tbody>
            {data.map(yearData => (
              <tr key={yearData.year} className="border-b hover:bg-muted/30">
                <td className="py-2 px-2 font-medium text-sm">{yearData.year}</td>
                {monthKeys.map(monthKey => {
                  const monthData = yearData[monthKey]
                  const value = monthData?.value

                  return (
                    <td
                      key={monthKey}
                      className="text-center py-2 px-1 text-xs relative"
                    >
                      {value !== null && (
                        <>
                          <span
                            className={
                              value >= 0 ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            {formatPerformanceValue(value)}
                          </span>
                          {monthData.isBest && (
                            <div className="text-[10px] text-green-600">
                              <span>best</span>
                              <ArrowUpIcon className="h-2 w-2 inline ml-0.5" />
                            </div>
                          )}
                          {monthData.isWorst && (
                            <div className="text-[10px] text-red-600">
                              <span>worst</span>
                              <ArrowDownIcon className="h-2 w-2 inline ml-0.5" />
                            </div>
                          )}
                        </>
                      )}
                      {value === null && (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  )
                })}
                <td className="text-center py-2 px-2 text-xs font-medium">
                  {yearData.yearToDate !== null
                    ? formatPerformanceValue(yearData.yearToDate)
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default NetPerformanceSummary