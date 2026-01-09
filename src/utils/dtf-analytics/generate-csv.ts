import { DTFMonthlyMetrics, CSVHeader } from './types'

// Month names for display
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

/**
 * CSV column configuration
 */
export const CSV_HEADERS: CSVHeader[] = [
  { key: 'dtfSymbol', label: 'DTF Symbol' },
  { key: 'dtfName', label: 'DTF Name' },
  { key: 'chainName', label: 'Chain' },
  { key: 'monthName', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'totalSupply', label: 'Total Supply (Token)' },
  { key: 'marketCapUsd', label: 'Market Cap (USD)' },
  { key: 'tokensLocked', label: 'Tokens Locked (Amount)' },
  { key: 'tokensLockedUsd', label: 'Tokens Locked (USD)' },
  { key: 'cumulativeTokensLocked', label: 'Cumulative Tokens Locked (Amount)' },
  { key: 'cumulativeTokensLockedUsd', label: 'Cumulative Tokens Locked (USD)' },
  { key: 'tvlUsd', label: 'TVL (USD)' },
  { key: 'totalRevenue', label: 'Total Revenue (Token)' },
  { key: 'totalRevenueUsd', label: 'Total Revenue (USD)' },
  { key: 'tvlFeeRevenue', label: 'TVL Fee Revenue (Token)' },
  { key: 'tvlFeeRevenueUsd', label: 'TVL Fee Revenue (USD)' },
  { key: 'mintingFeeRevenue', label: 'Minting Fee Revenue (Token)' },
  { key: 'mintingFeeRevenueUsd', label: 'Minting Fee Revenue (USD)' },
  { key: 'monthlyMinted', label: 'Total Minted (Token)' },
  { key: 'monthlyMintedUsd', label: 'Total Minted (USD)' },
  { key: 'governanceRevenue', label: 'Revenue to Vote Lockers (Token)' },
  { key: 'governanceRevenueUsd', label: 'Revenue to Vote Lockers (USD)' },
  { key: 'externalRevenue', label: 'Revenue to External (Token)' },
  { key: 'externalRevenueUsd', label: 'Revenue to External (USD)' },
  { key: 'protocolRevenue', label: 'Revenue to Protocol (Token)' },
  { key: 'protocolRevenueUsd', label: 'Revenue to Protocol (USD)' },
  { key: 'estRsrBurnAmount', label: 'Est RSR Burn Amount' },
  { key: 'holderCount', label: 'Holder Count' },
  { key: 'dtfPrice', label: 'DTF Price (USD)' },
  { key: 'rsrPrice', label: 'RSR Price (USD)' },
  { key: 'voteLockPrice', label: 'Vote Lock Token Price (USD)' },
  // Cumulative values
  { key: 'cumulativeRevenue', label: 'Cumulative Revenue (Token)' },
  { key: 'cumulativeRevenueUsd', label: 'Cumulative Revenue (USD)' },
  { key: 'cumulativeMinted', label: 'Cumulative Minted (Token)' },
  { key: 'cumulativeMintedUsd', label: 'Cumulative Minted (USD)' },
  {
    key: 'cumulativeGovernanceRevenue',
    label: 'Cumulative Revenue to Vote Lockers (Token)',
  },
  {
    key: 'cumulativeGovernanceRevenueUsd',
    label: 'Cumulative Revenue to Vote Lockers (USD)',
  },
  {
    key: 'cumulativeExternalRevenue',
    label: 'Cumulative Revenue to External (Token)',
  },
  {
    key: 'cumulativeExternalRevenueUsd',
    label: 'Cumulative Revenue to External (USD)',
  },
  {
    key: 'cumulativeProtocolRevenue',
    label: 'Cumulative Revenue to Protocol (Token)',
  },
  {
    key: 'cumulativeProtocolRevenueUsd',
    label: 'Cumulative Revenue to Protocol (USD)',
  },
  { key: 'cumulativeEstRsrBurnAmount', label: 'Cumulative Est RSR Burn Amount' },
]

/**
 * Formats a number for CSV output
 * - Rounds to reasonable precision
 * - Handles very small and very large numbers
 */
function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0'
  }

  // For very small numbers, use scientific notation or fixed decimals
  if (Math.abs(value) < 0.000001 && value !== 0) {
    return value.toExponential(6)
  }

  // For currency/USD values, use 2 decimal places
  if (Math.abs(value) >= 0.01) {
    return value.toFixed(2)
  }

  // For small token amounts, use more precision
  return value.toFixed(8)
}

/**
 * Escapes a value for CSV (handles commas, quotes, newlines)
 */
function escapeCSVValue(value: string | number): string {
  const stringValue = String(value)

  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Generates CSV content from monthly metrics
 */
export function generateCSV(allMetrics: DTFMonthlyMetrics[]): string {
  // Create header row
  const headerRow = CSV_HEADERS.map((h) => escapeCSVValue(h.label)).join(',')

  // Create data rows
  const dataRows = allMetrics.map((metrics) => {
    return CSV_HEADERS.map((header) => {
      let value: string | number

      // Handle special cases
      if (header.key === 'monthName') {
        value = MONTH_NAMES[metrics.month - 1] || `Month ${metrics.month}`
      } else {
        const rawValue = metrics[header.key as keyof DTFMonthlyMetrics]

        if (typeof rawValue === 'number') {
          value = formatNumber(rawValue)
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

/**
 * Downloads CSV content as a file
 */
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

  // Clean up the URL object
  URL.revokeObjectURL(url)
}

/**
 * Generates the filename for the export
 */
export function generateFilename(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `index-dtf-analytics-${year}-${month}-${day}.csv`
}
