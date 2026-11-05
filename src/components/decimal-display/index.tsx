import { useMemo } from 'react'

const suffixes = ['', 'K', 'M', 'B', 'T']

// Rendered when the input can't be formatted into a real number (NaN/±Infinity).
// A money-display component must never turn a garbage value into a confident
// "0" / "∞" — surface it as unavailable instead (Z11).
const UNAVAILABLE = '—'
const SUBSCRIPT_MIN_ZEROS = 3

export const formatNumberValue = (
  value: number | string,
  decimals: number,
  currency: boolean,
  compact: boolean,
  trimZeros: boolean
): string => {
  // Convert to number if it's a string
  const num = typeof value === 'string' ? Number.parseFloat(value) : value

  // Non-finite input (NaN, ±Infinity) has no real numeric rendering — never
  // mask it as 0/∞ (Z11).
  if (!Number.isFinite(num)) {
    return UNAVAILABLE
  }

  // Special case for zero
  if (num === 0) {
    return '0'
  }

  const absNum = Math.abs(num)

  // Use compact formatting if the number is >= 1,000 and compact is true
  if (compact && absNum >= 1000) {
    const suffixNum = Math.min(4, Math.floor(Math.log10(absNum) / 3))
    const shortValue = absNum / Math.pow(1000, suffixNum)
    const suffix = suffixes[suffixNum]
    const sign = num < 0 ? '-' : ''
    return `${sign}${shortValue.toFixed(1)}${suffix}`
  }

  // For non-compact formatting
  if (absNum >= 1 || absNum === 0) {
    let formatted: string
    if (trimZeros) {
      // Use toPrecision to get significant digits, then parseFloat to remove trailing zeros
      formatted = Number.parseFloat(absNum.toPrecision(15)).toString()
      // If there are more decimal places than specified, truncate
      const parts = formatted.split('.')
      if (parts[1] && parts[1].length > decimals) {
        formatted = absNum.toFixed(decimals)
      }
    } else {
      formatted = absNum.toFixed(decimals)
    }

    const withCommas = currency
      ? Number(formatted).toLocaleString('en-US')
      : formatted
    return `${num < 0 ? '-' : ''}${withCommas}`
  } else {
    // Zeros after the point before the first significant digit; a subscript only pays off from three on.
    const leadingZeros = Math.floor(-Math.log10(absNum))
    const sign = num < 0 ? '-' : ''
    if (leadingZeros < SUBSCRIPT_MIN_ZEROS) {
      return `${sign}${absNum.toFixed(leadingZeros + decimals)}`
    }
    // toExponential rounds the significant digits; slicing toFixed(27) truncated float error (0.0012 → 11).
    const significant = absNum
      .toExponential(Math.max(decimals - 1, 0))
      .split('e')[0]
      .replace('.', '')
    return `${sign}0.0<sub>${leadingZeros}</sub>${significant}`
  }
}

export const useNumberFormat = (
  value: number | string,
  decimals: number,
  currency: boolean,
  compact: boolean,
  trimZeros: boolean
): string =>
  useMemo(
    () => formatNumberValue(value, decimals, currency, compact, trimZeros),
    [value, decimals, currency, compact, trimZeros]
  )

interface DecimalDisplayProps {
  value: number | string
  decimals?: number
  currency?: boolean
  compact?: boolean
  trimZeros?: boolean
  className?: string
}

export const DecimalDisplay: React.FC<DecimalDisplayProps> = ({
  value,
  decimals = 2,
  currency = true,
  trimZeros = true,
  compact = false,
  className,
}) => {
  const formattedNumber = useNumberFormat(
    value,
    decimals,
    currency,
    compact,
    trimZeros
  )

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: formattedNumber }}
    />
  )
}

export default DecimalDisplay
