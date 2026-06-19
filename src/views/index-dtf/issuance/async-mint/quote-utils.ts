import { formatTokenAmount } from '@/utils'
import { AsyncZapQuote } from '@reserve-protocol/async-zap-sdk'
import { formatUnits } from 'viem'

// Below this (unfavorable) price impact the figure turns destructive.
export const HIGH_PRICE_IMPACT = 0.02 // 2%

export const formatTokenBalance = (value: bigint, decimals: number) =>
  formatTokenAmount(Number(formatUnits(value, decimals)))

// Signed percentage; collapses imperceptible values to ~0.00% to avoid "-0.00%".
export const formatPriceImpact = (impact: number) => {
  const pct = impact * 100
  if (Math.abs(pct) < 0.01) return '~0.00%'
  return `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`
}

export const formatOrderCountdown = (seconds: number) => {
  if (seconds <= 0) return '0s'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) return `${remainingSeconds}s`

  return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`
}

export const ceilDiv = (value: bigint, divisor: bigint) =>
  divisor === 0n ? 0n : (value + divisor - 1n) / divisor

// Shares received after the Folio mint fee: the minter pays it off the top, so
// the collateral-backed shares overstate what lands in the wallet.
export const subtractMintFee = (shares: bigint, mintFee: bigint) =>
  shares - ceilDiv(shares * mintFee, 10n ** 18n)

// Quote token (input/output token, e.g. USDC) actually consumed from the user's
// input. The SDK's `totalQuoteTokenAmount` reflects the CoW swap spend; when the
// quote token is itself a basket collateral, that portion is provided directly
// (no swap) and isn't reliably included in the total. So add the direct
// collateral that isn't already represented in a leg's amount, excluding any
// wallet-sourced amount. Written to be safe whether or not the SDK includes the
// direct leg in the total (the `inLegs` subtraction prevents double-counting).
export function getQuoteTokenSpent(
  quote: AsyncZapQuote,
  inputTokenAddress: string
): bigint {
  const lower = inputTokenAddress.toLowerCase()
  const matchingLegs = quote.legs.filter(
    (leg) => leg.asset.address.toLowerCase() === lower
  )
  const inLegs = matchingLegs.reduce(
    (sum, leg) => sum + leg.quoteTokenAmount,
    0n
  )
  const fromWallet = matchingLegs.reduce(
    (sum, leg) => sum + leg.balanceUsed,
    0n
  )
  const collateral = quote.folioAssets
    .filter((fa) => fa.asset.address.toLowerCase() === lower)
    .reduce((sum, fa) => sum + fa.amount, 0n)
  const directFromInput = collateral - inLegs - fromWallet
  return (
    quote.totalQuoteTokenAmount + (directFromInput > 0n ? directFromInput : 0n)
  )
}
