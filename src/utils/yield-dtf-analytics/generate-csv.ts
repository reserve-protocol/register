import { YieldDTFMonthlyMetrics, CSVHeader } from './types'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const CSV_HEADERS: CSVHeader[] = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'name', label: 'Name' },
  { key: 'chainName', label: 'Chain' },
  { key: 'monthName', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'totalSupply', label: 'Total Supply' },
  { key: 'price', label: 'Price (USD)' },
  { key: 'marketCap', label: 'Market Cap (USD)' },
  { key: 'monthlyMinted', label: 'Monthly Minted' },
  { key: 'monthlyBurned', label: 'Monthly Burned' },
  { key: 'holderRevenueUsd', label: 'Holder Revenue (USD)' },
  { key: 'stakerRevenueUsd', label: 'Staker Revenue (USD)' },
  { key: 'totalRevenueUsd', label: 'Total Revenue (USD)' },
  { key: 'rsrStaked', label: 'RSR Staked' },
  { key: 'rsrStakedUsd', label: 'RSR Staked (USD)' },
  { key: 'rsrExchangeRate', label: 'RSR Exchange Rate' },
  { key: 'rsrPrice', label: 'RSR Price (USD)' },
  { key: 'holderCount', label: 'Holder Count' },
  { key: 'cumulativeMinted', label: 'Cumulative Minted' },
  { key: 'cumulativeBurned', label: 'Cumulative Burned' },
  {
    key: 'cumulativeHolderRevenueUsd',
    label: 'Cumulative Holder Revenue (USD)',
  },
  {
    key: 'cumulativeStakerRevenueUsd',
    label: 'Cumulative Staker Revenue (USD)',
  },
  {
    key: 'cumulativeTotalRevenueUsd',
    label: 'Cumulative Total Revenue (USD)',
  },
]

function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0'
  if (Math.abs(value) < 0.000001 && value !== 0) return value.toExponential(6)
  if (Math.abs(value) >= 0.01) return value.toFixed(2)
  return value.toFixed(8)
}

function escapeCSVValue(value: string | number): string {
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function generateCSV(allMetrics: YieldDTFMonthlyMetrics[]): string {
  const headerRow = CSV_HEADERS.map((h) => escapeCSVValue(h.label)).join(',')

  const dataRows = allMetrics.map((metrics) => {
    return CSV_HEADERS.map((header) => {
      let value: string | number

      if (header.key === 'monthName') {
        value = MONTH_NAMES[metrics.month - 1] || `Month ${metrics.month}`
      } else {
        const rawValue = metrics[header.key as keyof YieldDTFMonthlyMetrics]
        if (typeof rawValue === 'number') {
          // holderCount should be integer
          if (header.key === 'holderCount') {
            value = String(Math.round(rawValue))
          } else {
            value = formatNumber(rawValue)
          }
        } else if (rawValue === undefined || rawValue === null) {
          value = ''
        } else {
          value = String(rawValue)
        }
      }

      return escapeCSVValue(value)
    }).join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function generateFilename(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `yield-dtf-analytics-${year}-${month}-${day}.csv`
}
