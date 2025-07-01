/**
 * Utility functions for formatting numbers and currency
 */

/**
 * Format a number as currency with appropriate precision
 */
export function formatCurrency(
  value: number, 
  decimals: number = 2, 
  locale: string = 'en-US'
): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0'
  }

  // Handle very small numbers
  if (Math.abs(value) < 0.01 && value !== 0) {
    return '< 0.01'
  }

  // Handle very large numbers
  if (Math.abs(value) >= 1e12) {
    return (value / 1e12).toFixed(2) + 'T'
  }
  if (Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(2) + 'B'
  }
  if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(2) + 'M'
  }
  if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(2) + 'K'
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a number with commas as thousands separators
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0'
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a percentage value
 */
export function formatPercentage(
  value: number,
  decimals: number = 2
): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0%'
  }

  return `${formatNumber(value, decimals)}%`
}

/**
 * Format a token amount with appropriate precision
 */
export function formatTokenAmount(
  value: number | string,
  decimals: number = 4
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return '0'
  }

  return formatNumber(numValue, decimals)
}