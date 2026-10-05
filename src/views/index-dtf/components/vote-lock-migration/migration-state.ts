import { zeroAddress } from 'viem'

export type MigrationStep = 'redeem' | 'approve' | 'deposit' | 'done'

// Only a retired vault (renounced owner, zero delay) pays RSR out in the redeem itself.
export const isRetiredWithBalance = ({
  owner,
  unstakingDelay,
  shares,
}: {
  owner?: string
  unstakingDelay?: bigint
  shares?: bigint
}) =>
  owner?.toLowerCase() === zeroAddress &&
  unstakingDelay === 0n &&
  !!shares &&
  shares > 0n

export const getMigrationStep = ({
  redeemedAssets,
  allowance,
  deposited,
}: {
  redeemedAssets?: bigint
  allowance?: bigint
  deposited: boolean
}): MigrationStep => {
  if (deposited) return 'done'
  if (redeemedAssets === undefined) return 'redeem'
  if (allowance !== undefined && allowance >= redeemedAssets) return 'deposit'
  return 'approve'
}
