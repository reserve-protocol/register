import dayjs from 'dayjs'
import type { PerformanceData } from '../types/factsheet-data'
import { CalendarRange } from 'lucide-react'

interface PerformanceTableProps {
  performance: PerformanceData
  inception: number
}

const formatPerformanceValue = (value: number | null): string => {
  if (value === null) return 'N/A'
  return `${value.toFixed(2)}%`
}

const PerformanceTable = ({
  performance,
  inception,
}: PerformanceTableProps) => {
  const now = Date.now() / 1000
  const inceptionDate = dayjs.unix(inception).format('MMM D, YYYY')
  const currentDate = dayjs.unix(now).format('MMM D, YYYY')

  const rows = [
    { label: '3 Month', value: performance['3m'] },
    { label: '6 Month', value: performance['6m'] },
    { label: 'YTD', value: performance.ytd },
    { label: '1 Year', value: performance['1y'] },
    { label: 'All Time', value: performance.all },
  ]

  return (
    <div className="bg-transparent text-white dark:text-foreground h-full flex flex-col justify-end w-full pt-6">
      <div className="w-8 h-8 border border-white rounded-full flex items-center justify-center mb-auto mx-6">
        <CalendarRange className="w-4 h-4" />
      </div>
      <div>
        <div className="mx-6 mb-6">
          <h3 className="text-2xl font-light mb-1">
            Performance from inception*
          </h3>
          <p className="text-sm">
            ({inceptionDate} - {currentDate})
          </p>
        </div>

        <div className="border-t border-white/10">
          <table className="w-full table-fixed">
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-white/10 dark:border-border/50 last:border-0"
                >
                  <td className="w-1/2 px-5 py-6 text-sm text-white/70 dark:text-muted-foreground align-middle">
                    {row.label}
                  </td>
                  <td
                    className={`w-1/2 px-5 py-6 text-sm font-light text-right align-middle border-l border-white/10 dark:border-border/50 ${
                      row.value === null
                        ? 'text-white/40 dark:text-muted-foreground'
                        : 'text-white dark:text-foreground'
                    }`}
                  >
                    {formatPerformanceValue(row.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PerformanceTable
