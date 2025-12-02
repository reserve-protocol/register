/**
 * Adjusts the max amount to prevent rounding errors in transactions.
 * If the balance has 18 decimals, it reduces to 17 decimals.
 *
 * @param balanceStr - The balance as a string
 * @returns The adjusted balance string
 */
export const adjustMaxAmount = (balanceStr: string): string => {
  if (!balanceStr || balanceStr === '0') {
    return balanceStr
  }

  const parts = balanceStr.split('.')

  // No decimals, use as is
  if (!parts[1] || parts[1].length === 0) {
    return balanceStr
  }

  const decimals = parts[1]

  // If it has exactly 18 decimals, reduce to 17
  if (decimals.length === 18) {
    // Remove the last decimal place
    const adjustedDecimals = decimals.slice(0, 17)
    return parts[0] + '.' + adjustedDecimals
  }

  // For any other decimal length, return as is
  return balanceStr
}