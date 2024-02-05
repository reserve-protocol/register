import { TokenQuantity } from '@reserve-protocol/token-zapper'

export const SIX_DIGITS = 10n ** 6n
export const FOUR_DIGITS = 10n ** 4n
export const TWO_DIGITS = 10n ** 2n

const getApproximateScale = (qty: TokenQuantity) => {
  const integerPart = qty.amount / qty.token.scale
  if (integerPart === 0n) {
    return FOUR_DIGITS
  }
  if (integerPart < 10000n) {
    return TWO_DIGITS
  }
  return 1n
}

const formatWithSymbol = (amount: TokenQuantity) => {
  if (amount.token.symbol === "USD") {
    return '$' + amount.format()
  }
  return amount.formatWithSymbol()
}
const formatQty_ = (qty: TokenQuantity, divisor: bigint) => {
  if (qty.amount === 0n) {
    return formatWithSymbol(qty)
  }
  const withScaleDecimals = (qty.amount / divisor) * divisor
  if (withScaleDecimals === 0n) {
    return '<' + formatWithSymbol(qty.token.from(divisor))
  }
  return formatWithSymbol(qty.token.from(withScaleDecimals))
}

/** Formats a token quantity into string rounding the number of digits to 
// the given digits scale. For example, if the digits scale is 10^4, then it will
// round to 4 digits after the decimal point.
// This function will also append the token symbol to the end of the string.
// If the value is non-zero, but less than what can be represented given the number of digits
// returns the smallest representable string with a < prefix.
// @examples
// const FOUR_DIGITS = 10n**4n
// formatQty(eth.fromDecimal("1.0"), 10n**4n) => "1.0 ETH"
// formatQty(eth.fromDecimal("1.0001"), 10n**4n) => "1.0001 ETH"
// formatQty(eth.fromDecimal("1.00001"), 10n**4n) => "1.0 ETH"
// formatQty(eth.fromDecimal("0.00001"), 10n**4n) => "<0.0001 ETH"
*/
export const formatQty = (qty: TokenQuantity, digitsScale?: bigint) => {
  return formatQty_(qty, qty.token.scale / (digitsScale ?? getApproximateScale(qty)))
}

export const formatQtyNoLessThan0 = (qty: TokenQuantity, digitsScale?: bigint) => {
  const divisor = qty.token.scale / (digitsScale ?? getApproximateScale(qty))
  if (qty.amount / divisor < 0n) {
    return null
  }
  return formatQty_(qty, divisor)
}
