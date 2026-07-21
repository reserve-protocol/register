// A missing price-feed entry resolves to an explicit availability flag so USD
// figures are suppressed, never fabricated from $1/$0 (Z6).
export const resolveInputTokenPrice = (
  inputPrices: { price?: number }[] | undefined
): { price: number; available: boolean } => {
  const price = inputPrices?.[0]?.price
  if (typeof price === 'number' && Number.isFinite(price) && price > 0) {
    return { price, available: true }
  }
  return { price: 0, available: false }
}
