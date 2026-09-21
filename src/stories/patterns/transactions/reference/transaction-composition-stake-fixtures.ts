export type StakeFixtureKind = 'stake' | 'unstake'

export type StakeFixtureQuote = {
  inputAmount: string
  outputAmount: string
  usdValue: string
}

const AMOUNT_SCALE = 1_000_000n
const RATE_SCALE = 100_000n
const STAKED_RSR_RATE = 114_384n
const RSR_USD_CENTS = 585n

export const getStakeFixtureQuote = (
  kind: StakeFixtureKind,
  value: string
): StakeFixtureQuote | null => {
  const inputAmount = parseFixtureAmount(value)

  if (inputAmount === null) return null

  const outputAmount =
    kind === 'stake'
      ? divideRounded(inputAmount * RATE_SCALE, STAKED_RSR_RATE)
      : divideRounded(inputAmount * STAKED_RSR_RATE, RATE_SCALE)
  const rsrAmount = kind === 'stake' ? inputAmount : outputAmount
  const usdCents = divideRounded(rsrAmount * RSR_USD_CENTS, AMOUNT_SCALE)

  return {
    inputAmount: formatFixtureAmount(inputAmount, 6, 0),
    outputAmount: formatFixtureAmount(outputAmount, 2, 2),
    usdValue: formatFixtureCurrency(usdCents),
  }
}

const parseFixtureAmount = (value: string): bigint | null => {
  const normalized = value.replaceAll(',', '').trim()
  const match = /^(\d{0,12})(?:\.(\d{0,6}))?$/.exec(normalized)

  if (!match || (!match[1] && !match[2])) return null

  const whole = BigInt(match[1] || '0')
  const fraction = BigInt((match[2] ?? '').padEnd(6, '0'))

  return whole * AMOUNT_SCALE + fraction
}

const divideRounded = (value: bigint, divisor: bigint) =>
  (value + divisor / 2n) / divisor

const formatFixtureAmount = (
  value: bigint,
  maximumFractionDigits: number,
  minimumFractionDigits: number
) => {
  const omittedDecimals = 6 - maximumFractionDigits
  const roundingScale = 10n ** BigInt(omittedDecimals)
  const rounded = divideRounded(value, roundingScale)
  const displayScale = 10n ** BigInt(maximumFractionDigits)
  const whole = (rounded / displayScale)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const fraction = (rounded % displayScale)
    .toString()
    .padStart(maximumFractionDigits, '0')
    .replace(/0+$/, '')
    .padEnd(minimumFractionDigits, '0')

  return fraction ? `${whole}.${fraction}` : whole
}

const formatFixtureCurrency = (cents: bigint) => {
  const whole = (cents / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const fraction = (cents % 100n).toString().padStart(2, '0')

  return `$${whole}.${fraction}`
}
