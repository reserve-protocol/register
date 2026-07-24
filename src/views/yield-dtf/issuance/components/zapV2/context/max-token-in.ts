// WHY: maxAmount is a USD value (tokenOut.price * issuanceAvailable). Dividing
// by a fabricated price of 1 when tokenIn.price is missing yields a dollar
// figure treated as a token quantity — a confidently wrong Max. Return null
// when the input price is unusable so the caller surfaces "unavailable" instead
// of filling a garbage amount (Z10). Money surface — engineer review.
export const computeMaxTokenIn = (
  tokenOutPrice: number | undefined,
  issuanceAvailable: number | undefined,
  tokenInPrice: number | undefined
): number | null => {
  if (!tokenInPrice || !Number.isFinite(tokenInPrice) || tokenInPrice <= 0) {
    return null
  }
  const maxAmountUsd = (tokenOutPrice || 0) * (issuanceAvailable || 0)
  return maxAmountUsd / tokenInPrice
}
