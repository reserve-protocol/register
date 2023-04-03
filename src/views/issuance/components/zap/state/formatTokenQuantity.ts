import { entities } from '@reserve-protocol/token-zapper';

export const FOUR_DIGITS = 10n ** 4n;


const formatQty_ = (qty: entities.TokenQuantity, divisor: bigint) => {
  if (qty.amount === 0n) {
    return qty.formatWithSymbol();
  }
  const withScaleDecimals = (qty.amount / divisor) * divisor;
  if (withScaleDecimals === 0n) {
    return '<' + qty.token.quantityFromBigInt(divisor).formatWithSymbol();
  }
  return qty.token.quantityFromBigInt(withScaleDecimals).formatWithSymbol();
};

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
export const formatQty = (qty: entities.TokenQuantity, digitsScale: bigint) => {
  return formatQty_(qty, qty.token.scale / digitsScale);
};
