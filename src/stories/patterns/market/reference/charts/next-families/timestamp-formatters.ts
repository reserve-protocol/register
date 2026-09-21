import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export type ChartTimestampPrecision = 'day' | 'minute'

export function formatChartTimestamp(
  timestamp: number,
  precision: ChartTimestampPrecision
) {
  const format = precision === 'day' ? 'D MMM YYYY' : 'D MMM YYYY · HH:mm'
  return dayjs.unix(timestamp).utc().format(format)
}
