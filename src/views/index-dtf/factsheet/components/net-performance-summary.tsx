import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon } from 'lucide-react'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import type { NetPerformanceYear } from '../types/factsheet-data'
import React from 'react'

interface NetPerformanceSummaryProps {
  data: NetPerformanceYear[] | null
}

const monthColumns = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export const monthKeys = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const

const formatPerformanceValue = (value: number | null): string => {
  if (value === null || value === undefined) return '-'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

const NetPerformanceSummary = ({ data }: NetPerformanceSummaryProps) => {
  const dtf = useAtomValue(indexDTFAtom)

  // Show loading state or empty state if no data
  if (!data || data.length === 0) {
    return (
      <Card className="bg-background border-secondary rounded-none sm:rounded-3xl mx-1 mb-1">
        <div className="p-6">
          <h3 className="text-xl sm:text-2xl font-light mb-4">
            Net Performance Summary - {dtf?.token?.name || 'Index'}
          </h3>
          <div className="text-center py-8 text-muted-foreground">
            Loading performance data...
          </div>
        </div>
      </Card>
    )
  }

  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = ['Year', ...monthColumns, 'FY/YTD']
    const rows = data.map((yearData) => {
      const monthValues = monthKeys.map((key) => {
        const value = yearData[key]?.value
        return value !== null && value !== undefined ? value.toFixed(2) : ''
      })
      return [
        yearData.year,
        ...monthValues,
        yearData.yearToDate?.toFixed(2) || '',
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
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
    <Card className="bg-background border-secondary rounded-none sm:rounded-3xl mx-1 mb-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-6">
        <h3 className="text-xl sm:text-2xl font-light">
          Net Performance Summary - <br className="sm:hidden" />{' '}
          {dtf?.token?.name || 'Index'}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadCSV}
          className="flex items-center font-light h-8 gap-2 rounded-full"
        >
          <DownloadIcon className="h-4 w-4" />
          <span className="hidden md:inline">Download CSV</span>
          <span className="md:hidden">Download as CSV</span>
        </Button>
      </div>

      {/* Mobile view - list format */}
      <div className="block md:hidden">
        <div className="border-t border-border">
          <table className="w-full table-fixed">
            <tbody>
              {data.map((yearData, yearIdx) => (
                <React.Fragment key={yearData.year}>
                  {monthKeys.map((monthKey, idx) => {
                    const monthData = yearData[monthKey]
                    const value = monthData?.value
                    return (
                      <tr
                        key={`${yearData.year}-${monthKey}`}
                        className="border-b border-border"
                      >
                        <td className="w-1/2 px-6 py-5 text-sm align-middle">
                          {monthColumns[idx]} - {yearData.year}
                        </td>
                        <td className="w-1/2 px-5 py-5 text-sm font-light text-right align-middle border-l border-border">
                          {value !== null ? (
                            <span
                              className={
                                value >= 0 ? 'text-green-600' : 'text-red-600'
                              }
                            >
                              {formatPerformanceValue(value)}
                              {monthData?.isBest && (
                                <span className="text-green-600 ml-1 text-xs">
                                  ▲
                                </span>
                              )}
                              {monthData?.isWorst && (
                                <span className="text-red-600 ml-1 text-xs">
                                  ▼
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  <tr
                    key={`${yearData.year}-ytd`}
                    className={`border-b ${yearIdx === data.length - 1 ? 'border-b' : 'border-b-2'} border-border`}
                  >
                    <td className="w-1/2 px-6 py-5 text-sm align-middle">
                      FY/YTD - {yearData.year}
                    </td>
                    <td className="w-1/2 px-5 py-5 text-sm font-light text-right align-middle border-l border-border">
                      <span
                        className={
                          yearData.yearToDate !== null &&
                          yearData.yearToDate >= 0
                            ? 'text-green-600'
                            : yearData.yearToDate !== null
                              ? 'text-red-600'
                              : 'text-muted-foreground'
                        }
                      >
                        {yearData.yearToDate !== null
                          ? formatPerformanceValue(yearData.yearToDate)
                          : 'N/A'}
                      </span>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Desktop view - table format */}
      <div className="hidden md:block w-full max-w-full overflow-x-auto">
        <table className="w-full border-t [&_th]:h-12 [&_td]:h-12">
          <thead>
            <tr className="border-b">
              <th className="py-6 px-6 text-xs text-right"></th>
              {monthColumns.map((month) => (
                <th
                  key={month}
                  className="py-6 px-6 text-xs text-right font-light border-l"
                >
                  {month}
                </th>
              ))}
              <th className="py-6 px-6 text-xs text-right font-light border-l">
                FY/YTD
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((yearData) => (
              <tr
                key={yearData.year}
                className="border-b last:border-b-0 hover:bg-muted/30"
              >
                <td className="py-6 px-6 text-sm text-left">{yearData.year}</td>
                {monthKeys.map((monthKey) => {
                  const monthData = yearData[monthKey]
                  const value = monthData?.value

                  return (
                    <td
                      key={monthKey}
                      className="py-6 px-6 text-xs text-right font-light relative border-l"
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
                            <div className="text-[10px] text-green-600 -mt-1">
                              <span>best</span>
                              <ArrowUpIcon className="h-2 w-2 inline ml-0.5" />
                            </div>
                          )}
                          {monthData.isWorst && (
                            <div className="text-[10px] text-red-600 -mt-1">
                              <span>worst</span>
                              <ArrowDownIcon className="h-2 w-2 inline ml-0.5" />
                            </div>
                          )}
                        </>
                      )}
                      {value === null && (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                  )
                })}
                <td className="py-6 px-6 text-xs text-right font-light border-l">
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
