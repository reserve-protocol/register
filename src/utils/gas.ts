// EIP-7825: per-transaction gas cap introduced in the Fusaka hardfork
export const FUSAKA_GAS_LIMIT = 2n ** 24n

export function safeGasLimit(gas: bigint): bigint
export function safeGasLimit(gas: undefined): undefined
export function safeGasLimit(gas: null): null
export function safeGasLimit(
  gas: bigint | undefined | null
): bigint | undefined | null
export function safeGasLimit(
  gas: bigint | undefined | null
): bigint | undefined | null {
  if (gas === undefined || gas === null) return gas
  return gas < FUSAKA_GAS_LIMIT ? gas : FUSAKA_GAS_LIMIT
}
