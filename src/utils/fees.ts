// A fee outside [0, 100) has no displayable share-of-total split — callers render "Unavailable", never fabricate.
export const isDisplayablePlatformFee = (platformFee: number): boolean =>
  Number.isFinite(platformFee) && platformFee >= 0 && platformFee < 100

// Converts a contract percentage (share of NON-platform revenue) to share of total; guard with isDisplayablePlatformFee first.
export const getFeePercentAdjust = (platformFee: number): number =>
  100 / (100 - platformFee)

// Revenue shares are entered at 0.01% precision, so every fee percentage lives on
// the same basis-point grid — otherwise the shares can never total 100%.
const BPS_PER_PERCENT = 100
const TOTAL_BPS = 100n * BigInt(BPS_PER_PERCENT)
const ONE = 10n ** 18n

const toBps = (percent: number): bigint =>
  BigInt(Math.round(percent * BPS_PER_PERCENT))

export const quantizeFeePercent = (percent: number): number =>
  Number.isFinite(percent) ? Number(toBps(percent)) / BPS_PER_PERCENT : percent

// Platform fee percentage from the DAO fee registry's fraction; undefined when unreadable.
export const platformFeePercent = (
  numerator: bigint,
  denominator: bigint
): number | undefined =>
  denominator === 0n
    ? undefined
    : quantizeFeePercent(
        Number((numerator * 10n ** 9n) / denominator) / 10 ** 7
      )

// Share of TOTAL revenue → the contract's portion of the NON-platform pot, in 18 decimals.
export const revenuePortionFromShare = (
  sharePercent: number,
  platformFee: number
): bigint => {
  if (!Number.isFinite(sharePercent) || !Number.isFinite(platformFee)) return 0n

  const shareBps = toBps(sharePercent)
  const nonPlatformBps = TOTAL_BPS - toBps(platformFee)

  return nonPlatformBps > 0n
    ? (shareBps * ONE) / nonPlatformBps
    : (shareBps * ONE) / TOTAL_BPS
}

// Rounding each contract portion to the 0.01% grid independently can leave the
// displayed shares a few hundredths off the pot, which reads back as an
// over/under-allocated form nobody edited. The largest share absorbs the drift;
// a gap bigger than one grid step per share is real, so it is left alone.
export const absorbShareDrift = (
  shares: number[],
  totalPercent: number
): number[] => {
  if (!shares.length || !Number.isFinite(totalPercent)) return shares

  const driftBps =
    toBps(totalPercent) - shares.reduce((sum, share) => sum + toBps(share), 0n)

  const tolerance = BigInt(shares.length)

  if (driftBps === 0n || driftBps > tolerance || driftBps < -tolerance)
    return shares

  const largest = shares.reduce(
    (best, share, index) => (share > shares[best] ? index : best),
    0
  )
  const correctedBps = toBps(shares[largest]) + driftBps

  if (correctedBps < 0n) return shares

  return shares.map((share, index) =>
    index === largest ? Number(correctedBps) / BPS_PER_PERCENT : share
  )
}

// Even split of a pot across participants; the last one absorbs the remainder so the shares total the pot exactly.
export const splitSharesEvenly = (
  totalPercent: number,
  participants: number
): number[] => {
  if (participants <= 0) return []

  const totalBps = toBps(totalPercent)
  const baseBps = totalBps / BigInt(participants)
  const lastBps = totalBps - baseBps * BigInt(participants - 1)

  return Array.from(
    { length: participants },
    (_, index) =>
      Number(index === participants - 1 ? lastBps : baseBps) / BPS_PER_PERCENT
  )
}
