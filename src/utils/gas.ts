// EIP-7825: per-transaction gas cap introduced in the Fusaka hardfork
export const FUSAKA_GAS_LIMIT = 2n ** 24n

export function capFusakaGasLimit(gas: bigint): bigint
export function capFusakaGasLimit(gas: undefined): undefined
export function capFusakaGasLimit(gas: null): null
export function capFusakaGasLimit(
  gas: bigint | undefined | null
): bigint | undefined | null
export function capFusakaGasLimit(
  gas: bigint | undefined | null
): bigint | undefined | null {
  if (gas === undefined || gas === null) return gas
  return gas < FUSAKA_GAS_LIMIT ? gas : FUSAKA_GAS_LIMIT
}
