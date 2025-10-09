import dayjs from 'dayjs'

export type TimeRange = '24h' | '7d' | '1m' | '3m' | '1y' | 'all'

/**
 * Formats x-axis tick labels for charts based on time range and DTF age
 * @param timestamp - Unix timestamp in seconds
 * @param range - The current time range selection
 * @param dtfTimestamp - The DTF creation timestamp for 'all' range formatting
 * @returns Formatted date string for the tick label
 */
export const formatXAxisTick = (
  timestamp: number,
  range: TimeRange = '1m',
  dtfTimestamp?: number
): string => {
  const date = dayjs.unix(timestamp)
  const now = Math.floor(Date.now() / 1_000)
  const dtfAge = dtfTimestamp ? now - dtfTimestamp : 0

  switch (range) {
    case '24h':
      return date.format('HH:mm')
    case '7d':
    case '1m':
    case '3m':
      return date.format('D MMM')
    case '1y':
      return date.format("MMM 'YY")
    case 'all':
      // Format based on DTF age
      if (dtfAge < 86_400) {
        // Less than 24h: use hourly format
        return date.format('HH:mm')
      } else if (dtfAge < 604_800) {
        // Less than 7d: use hourly format
        return date.format('HH:mm')
      } else if (dtfAge < 2_592_000) {
        // Less than 1m: use day format
        return date.format('D MMM')
      } else if (dtfAge < 31_536_000) {
        // Less than 1y: use day format
        return date.format('D MMM')
      } else {
        // More than 1y: use month/year format
        return date.format("MMM 'YY")
      }
    default:
      return date.format('D MMM')
  }
}