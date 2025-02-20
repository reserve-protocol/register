import { useMemo } from 'react'

const suffixes = ['', 'K', 'M', 'B', 'T']

export const useNumberFormat = (
  value: number | string,
  decimals: number,
  currency: boolean,
  compact: boolean,
  trimZeros: boolean
): string => {
  return useMemo(() => {
    // Convert to number if it's a string
    const num = typeof value === 'string' ? Number.parseFloat(value) : value

    // Special case for zero
    if (num === 0) {
      return currency ? `$0` : '0'
    }

    const absNum = Math.abs(num)

    // Only use compact formatting if the number is >= 1,000,000 and compact is true
    if (compact && absNum >= 1000000) {
      const suffixNum = Math.min(4, Math.floor(Math.log10(absNum) / 3))
      const shortValue = absNum / Math.pow(1000, suffixNum)
      const suffix = suffixes[suffixNum]
      const sign = num < 0 ? '-' : ''
      return `${currency ? '$' : ''}${sign}${shortValue.toFixed(1)}${suffix}`
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
      return `${num < 0 ? '-' : ''}${currency ? '$' : ''}${withCommas}`
    } else {
      // For numbers < 1, use the original formatting with subscript
      const fullNumber = absNum.toFixed(27)
      const [, decimalPart = ''] = fullNumber.split('.')
      const leadingZeros = decimalPart.match(/^0+/)?.[0] || ''
      const significantDecimals = decimalPart.slice(leadingZeros.length)

      let formattedNumber = '0'
      if (leadingZeros.length > 0) {
        formattedNumber += `.0<sub>${leadingZeros.length}</sub>${significantDecimals.slice(0, decimals)}`
      } else if (significantDecimals) {
        formattedNumber += `.${significantDecimals.slice(0, decimals)}`
      }

      return `${num < 0 ? '-' : ''}${currency ? '$' : ''}${formattedNumber}`
    }
  }, [value, decimals, currency, compact, trimZeros])
}

interface DecimalDisplayProps {
  value: number | string
  decimals?: number
  currency?: boolean
  compact?: boolean
  trimZeros?: boolean
}

export const DecimalDisplay: React.FC<DecimalDisplayProps> = ({
  value,
  decimals = 2,
  currency = false,
  compact = false,
  trimZeros = true,
}) => {
  const formattedNumber = useNumberFormat(
    value,
    decimals,
    currency,
    compact,
    trimZeros
  )

  return <span dangerouslySetInnerHTML={{ __html: formattedNumber }} />
}

export default DecimalDisplay
