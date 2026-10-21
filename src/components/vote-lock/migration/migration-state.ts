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

// An existing new-vault delegation wins because it covers every share the holder already has there.
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

export type SafeStepOutcome =
  | { step: 'redeem'; assets: bigint }
  | { step: 'approve' }
  | { step: 'deposit' }

// A Safe step is done once its on-chain effect shows: old shares gone, allowance covers the lock, or new shares up.
export const getSafeStepOutcome = ({
  step,
  baseline,
  oldShares,
  walletBalance,
  allowance,
  lockAmount,
  newShares,
}: {
  step: 'redeem' | 'approve' | 'deposit'
  baseline?: bigint
  oldShares?: bigint
  walletBalance?: bigint
  allowance?: bigint
  lockAmount?: bigint
  newShares?: bigint
}): SafeStepOutcome | undefined => {
  if (step === 'redeem') {
    if (oldShares !== 0n || walletBalance === undefined || baseline === undefined) return undefined
    return { step, assets: walletBalance > baseline ? walletBalance - baseline : 0n }
  }
  if (step === 'approve') {
    return allowance !== undefined && lockAmount !== undefined && allowance >= lockAmount
      ? { step }
      : undefined
  }
  return newShares !== undefined && baseline !== undefined && newShares > baseline
    ? { step }
    : undefined
}
