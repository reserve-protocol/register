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
