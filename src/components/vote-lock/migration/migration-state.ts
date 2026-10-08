import { zeroAddress, type Address } from 'viem'

export type MigrationStep = 'redeem' | 'approve' | 'deposit' | 'done'

// Only a retired vault (renounced owner, zero delay) pays RSR out in the redeem itself.
export const isRetired = ({
  owner,
  unstakingDelay,
}: {
  owner?: string
  unstakingDelay?: bigint
}) => owner?.toLowerCase() === zeroAddress && unstakingDelay === 0n

export const isRetiredWithBalance = ({
  owner,
  unstakingDelay,
  shares,
}: {
  owner?: string
  unstakingDelay?: bigint
  shares?: bigint
}) =>
  isRetired({ owner, unstakingDelay }) &&
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

// The redeem paid out `redeemed`; the wallet may have moved some since, and the lock can't exceed what's left.
export const getLockAmount = (
  redeemed: bigint | undefined,
  walletBalance: bigint | undefined
) =>
  redeemed === undefined || walletBalance === undefined
    ? undefined
    : redeemed < walletBalance
      ? redeemed
      : walletBalance

export type DepositChoice =
  | { type: 'deposit' }
  | { type: 'depositAndDelegate'; delegatee: Address; optimisticDelegatee: Address }

const isSet = (address: string | undefined): address is Address =>
  !!address && address.toLowerCase() !== zeroAddress

// The holder keeps their delegate: an existing vlRSR delegation wins (it covers every vlRSR share they hold),
// then the old vault's delegate, then the holder.
export const chooseDeposit = ({
  account,
  oldDelegate,
  delegate,
  optimisticDelegate,
}: {
  account: Address
  oldDelegate?: string
  delegate?: string
  optimisticDelegate?: string
}): DepositChoice => {
  if (isSet(delegate) && isSet(optimisticDelegate)) return { type: 'deposit' }
  const delegatee = isSet(delegate)
    ? delegate
    : isSet(oldDelegate)
      ? oldDelegate
      : account
  return {
    type: 'depositAndDelegate',
    delegatee,
    optimisticDelegatee: isSet(optimisticDelegate) ? optimisticDelegate : delegatee,
  }
}
