// WHY: a missing input-token price must never be silently treated as $1 — that
// renders a confidently wrong "You provide $X". Resolve to an explicit
// availability flag so the USD figure can be suppressed instead of fabricated
// (Z6). Money surface — engineer review.
export const resolveInputTokenPrice = (
  inputPrices: { price?: number }[] | undefined
): { price: number; available: boolean } => {
  const price = inputPrices?.[0]?.price
  if (typeof price === 'number' && Number.isFinite(price) && price > 0) {
    return { price, available: true }
  }
  return { price: 0, available: false }
}
