import type { Asset } from './fixtures'
import { validDecimal } from './model'

export function decimalUnits(value: string): bigint {
  const [whole, fraction = ''] = value.split('.')
  return BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, '0'))
}

export function allocations(units: string[], prices: string[]) {
  const unavailable = units.map(() => '—')
  if (
    units.length !== prices.length ||
    ![...units, ...prices].every(validDecimal)
  )
    return unavailable
  const amounts = units.map(
    (value, index) => decimalUnits(value) * decimalUnits(prices[index])
  )
  const total = amounts.reduce((sum, value) => sum + value, 0n)
  if (!total) return unavailable
  return amounts.map((amount) => {
    const bps = (amount * 10000n) / total
    return `${bps / 100n}.${(bps % 100n).toString().padStart(2, '0')}%`
  })
}

export function basketCsv(tokens: Asset[], values: string[]) {
  return [
    'symbol,address,value',
    ...tokens.map(
      (token, index) => `${token.symbol},${token.address},${values[index]}`
    ),
  ].join('\n')
}

export function parseBasketCsv(csv: string, tokens: Asset[]) {
  const invalid = () => {
    throw new Error('Failed to process CSV file. Please check the format.')
  }
  if (csv.length > 1024 * 1024)
    throw new Error('Please upload a CSV file less than 1MB.')
  const rows = csv.trim().split(/\r?\n/)
  if (
    rows
      .shift()
      ?.replace(/^\uFEFF/, '')
      .trim()
      .toLowerCase() !== 'symbol,address,value'
  )
    return invalid()
  const values = new Map<string, string>()
  for (const row of rows) {
    const cells = row.split(',').map((cell) => cell.trim())
    if (cells.length !== 3) return invalid()
    const [symbol, address, value] = cells
    const token = tokens.find(
      (token) => token.address.toLowerCase() === address.toLowerCase()
    )
    if (
      !token ||
      token.symbol !== symbol ||
      values.has(token.address) ||
      !validDecimal(value)
    )
      return invalid()
    values.set(token.address, value)
  }
  if (values.size !== tokens.length) return invalid()
  return tokens.map((token) => values.get(token.address)!)
}

export function usdFromCents(cents: bigint) {
  return `$${(cents / 100n).toLocaleString('en-US')}.${(cents % 100n).toString().padStart(2, '0')}`
}

export function tradeCents(capped: boolean, percent = 100) {
  return capped ? 7241916n : (62641681n * BigInt(percent)) / 100n
}
