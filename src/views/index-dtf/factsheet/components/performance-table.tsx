import dayjs from 'dayjs'
import type { PerformanceData } from '../mocks/factsheet-data'

interface PerformanceTableProps {
  performance: PerformanceData
  inception: number
}

const formatPerformanceValue = (value: number | null): string => {
  if (value === null) return 'N/A'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

const PerformanceTable = ({ performance, inception }: PerformanceTableProps) => {
  const now = Date.now() / 1000
  const inceptionDate = dayjs.unix(inception).format('MMM D, YYYY')
  const currentDate = dayjs.unix(now).format('MMM D, YYYY')

  const rows = [
    { label: '3 Month', value: performance['3m'] },
    { label: '6 Month', value: performance['6m'] },
    { label: 'YTD', value: performance.ytd },
    { label: '1 Year', value: performance['1y'] },
    { label: 'ITD (annualized)', value: performance.all }
  ]

  return (
    <div className="bg-transparent text-white dark:text-foreground h-full flex flex-col justify-end">
      <div>
        <h3 className="text-base font-medium mb-1">
          Performance from inception*
        </h3>
        <p className="text-xs text-white/50 dark:text-muted-foreground mb-4">
          ({inceptionDate} - {currentDate})
        </p>

        <div className="space-y-2">
          {rows.map(row => (
            <div
              key={row.label}
              className="flex justify-between items-center py-1.5 border-b border-white/10 dark:border-border/50 last:border-0"
            >
              <span className="text-sm text-white/70 dark:text-muted-foreground">
                {row.label}
              </span>
              <span
                className={`text-sm font-medium text-right ${
                  row.value === null
                    ? 'text-white/40 dark:text-muted-foreground'
                    : 'text-white'
                }`}
              >
                {formatPerformanceValue(row.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PerformanceTable