import { getWriteContractParams } from '@/components/vote-lock/utils'
import { useIsSafeAccount } from '@/hooks/use-is-safe-account'
import {
  prepareErc20Approval,
  prepareVoteLockDeposit,
  prepareVoteLockRedeem,
} from '@reserve-protocol/react-sdk'
import { useEffect, useRef, useState } from 'react'
import {
  erc20Abi,
  isAddressEqual,
  parseAbi,
  parseEventLogs,
  type Address,
  type Hex,
  type TransactionReceipt,
} from 'viem'
import {
  usePublicClient,
  useReadContract,
  useReadContracts,
  useTransactionReceipt,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import type { MigrationStepName } from './migration-record'
import { chooseDeposit, getLockAmount, getSafeStepOutcome } from './migration-state'
import { useMigrationRecord } from './use-migration-record'
import { legacyVaultAbi, type VoteLockMigration } from './use-vote-lock-migrations'

const withdrawEventAbi = parseAbi([
  'event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
])
const sharedVaultAbi = parseAbi([
  'function delegates(address) view returns (address)',
  'function optimisticDelegates(address) view returns (address)',
  'function depositAndDelegate(uint256 assets, address delegatee, address optimisticDelegatee) returns (uint256)',
])

export type MigrationFlowStep = MigrationStepName | 'done'

const redeemedFrom = (receipt: TransactionReceipt, oldVoteLock: Address) =>
  parseEventLogs({ abi: withdrawEventAbi, logs: receipt.logs, eventName: 'Withdraw' }).find(
    (log) => isAddressEqual(log.address, oldVoteLock)
  )?.args.assets

export const useMigrationFlow = (migration: VoteLockMigration) => {
  const { chainId, account, oldVoteLock, newVoteLock, underlying, shares } = migration
  const [record, update] = useMigrationRecord({ chainId, oldVoteLock, account })
  const redeemed = record.redeem?.assets
  const beforeRedeem = !record.redeem
  const isSafe = useIsSafeAccount(chainId, account)
  const safePending = record.pending?.viaSafe ? record.pending : undefined
  const poll = safePending ? { refetchInterval: 5_000 } : {}

  const { data: oldDelegate } = useReadContract({
    address: oldVoteLock,
    abi: legacyVaultAbi,
    functionName: 'delegates',
    args: [account],
    chainId,
    query: { enabled: !record.delegate },
  })
  const { data: estimate } = useReadContract({
    address: oldVoteLock,
    abi: legacyVaultAbi,
    functionName: 'previewRedeem',
    args: [shares],
    chainId,
    query: { enabled: beforeRedeem && shares > 0n },
  })
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: underlying,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [account, newVoteLock],
    chainId,
    query: poll,
  })
  // Read before the redeem too: a Safe redeem measures what it received against this balance.
  const { data: walletBalance, refetch: refetchBalance } = useReadContract({
    address: underlying,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account],
    chainId,
    query: poll,
  })
  const { data: newShares } = useReadContract({
    address: newVoteLock,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account],
    chainId,
    query: poll,
  })
  const { data: oldShares } = useReadContract({
    address: oldVoteLock,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account],
    chainId,
    query: { enabled: safePending?.step === 'redeem', ...poll },
  })
  const { data: sharedDelegation } = useReadContracts({
    contracts: [
      { address: newVoteLock, abi: sharedVaultAbi, functionName: 'delegates', args: [account], chainId },
      { address: newVoteLock, abi: sharedVaultAbi, functionName: 'optimisticDelegates', args: [account], chainId },
    ],
  })

  // A redeem recorded in an earlier session re-reads its receipt for the RSR actually paid out.
  const { data: redeemReceipt } = useTransactionReceipt({
    hash: record.redeem?.hash,
    chainId,
    query: { enabled: !!record.redeem && redeemed === undefined && !record.pending },
  })
  useEffect(() => {
    if (!redeemReceipt || redeemed !== undefined || redeemReceipt.status !== 'success') return
    const assets = redeemedFrom(redeemReceipt, oldVoteLock)
    if (assets !== undefined) {
      update((current) => ({ ...current, redeem: { hash: redeemReceipt.transactionHash, assets } }))
    }
  }, [oldVoteLock, redeemReceipt, redeemed, update])

  const client = usePublicClient({ chainId })
  const {
    data: pendingReceipt,
    error: pendingError,
    refetch: refetchPending,
  } = useWaitForTransactionReceipt({
    hash: safePending ? undefined : record.pending?.hash,
    chainId,
  })
  const [failed, setFailed] = useState<MigrationStepName>()
  const handled = useRef<Hex>()
  useEffect(() => {
    const pending = record.pending
    if (!pending || !pendingReceipt || handled.current === pendingReceipt.transactionHash) return
    handled.current = pendingReceipt.transactionHash
    if (pendingReceipt.status !== 'success') {
      setFailed(pending.step)
      update(({ pending: _, ...rest }) => rest)
      return
    }
    if (pending.step === 'redeem') {
      const assets = redeemedFrom(pendingReceipt, oldVoteLock)
      // A replacement transaction can succeed without redeeming from the old vault.
      if (assets === undefined) {
        setFailed('redeem')
        update(({ pending: _, ...rest }) => rest)
        migration.refetch()
        return
      }
      update(({ pending: _, ...rest }) => ({ ...rest, redeem: { hash: pending.hash, assets } }))
      void refetchBalance()
      void refetchAllowance()
      migration.refetch()
    }
    setFailed(undefined)
    if (pending.step === 'approve') {
      update(({ pending: _, ...rest }) => ({ ...rest, approve: { hash: pending.hash } }))
      void refetchAllowance()
    }
    if (pending.step === 'deposit') {
      update(({ pending: _, ...rest }) => ({ ...rest, deposit: { hash: pending.hash }, completed: true }))
      migration.refetch()
    }
  }, [migration, oldVoteLock, pendingReceipt, record.pending, refetchAllowance, refetchBalance, update])

  // Slow chains outlast the receipt wait timeout, so only a transaction the node no longer knows frees the step.
  useEffect(() => {
    const pending = record.pending
    if (!pending || !pendingError || !client) return
    let cancelled = false
    client.getTransaction({ hash: pending.hash }).then(
      () => {
        if (!cancelled) void refetchPending()
      },
      () => {
        if (cancelled) return
        setFailed(pending.step)
        update(({ pending: _, ...rest }) => rest)
        void refetchAllowance()
        migration.refetch()
      }
    )
    return () => {
      cancelled = true
    }
  }, [client, migration, pendingError, record.pending, refetchAllowance, refetchPending, update])


  const lockAmount = getLockAmount(redeemed, walletBalance)

  const settlingRedeem = useRef<Hex>()
  useEffect(() => {
    if (!safePending) return
    const { hash, baseline } = safePending
    // The balance polls on its own clock, so re-read it once the old shares are gone before measuring the payout.
    if (safePending.step === 'redeem') {
      if (oldShares !== 0n || settlingRedeem.current === hash) return
      settlingRedeem.current = hash
      void refetchBalance().then(({ data: balance }) => {
        const outcome = getSafeStepOutcome({ step: 'redeem', baseline, oldShares: 0n, walletBalance: balance })
        if (outcome?.step !== 'redeem') {
          settlingRedeem.current = undefined
          return
        }
        update(({ pending: _, ...rest }) => ({ ...rest, viaSafe: true, redeem: { hash, assets: outcome.assets } }))
        void refetchAllowance()
        migration.refetch()
      })
      return
    }
    const outcome = getSafeStepOutcome({
      step: safePending.step,
      baseline,
      allowance,
      lockAmount,
      newShares,
    })
    if (!outcome) return
    if (outcome.step === 'approve') {
      update(({ pending: _, ...rest }) => ({ ...rest, viaSafe: true, approve: { hash } }))
    }
    if (outcome.step === 'deposit') {
      update(({ pending: _, ...rest }) => ({ ...rest, viaSafe: true, deposit: { hash }, completed: true }))
      migration.refetch()
    }
  }, [allowance, lockAmount, migration, newShares, oldShares, refetchAllowance, refetchBalance, safePending, update])
  const recovering = !!record.redeem && redeemed === undefined
  const nothingToLock = !record.completed && !!record.redeem && lockAmount === 0n
  const step: MigrationFlowStep = record.completed
    ? 'done'
    : !record.redeem
      ? 'redeem'
      : allowance !== undefined && lockAmount !== undefined && allowance >= lockAmount
        ? 'deposit'
        : 'approve'
  const needsApproval =
    !!record.approve ||
    (beforeRedeem
      ? estimate === undefined || allowance === undefined || allowance < estimate
      : allowance === undefined || lockAmount === undefined || allowance < lockAmount)

  const deposit = chooseDeposit({
    account,
    oldDelegate: record.delegate ?? oldDelegate,
    delegate: sharedDelegation?.[0]?.result,
    optimisticDelegate: sharedDelegation?.[1]?.result,
  })
  const delegatee =
    deposit.type === 'deposit'
      ? (sharedDelegation?.[0]?.result as Address | undefined)
      : deposit.delegatee

  const { writeContract, isPending: isSigning } = useWriteContract()
  const [rejected, setRejected] = useState(false)

  const submit = () => {
    if (step === 'done' || recovering || nothingToLock || record.pending) return
    // Depositing without the current delegation would re-delegate every share the holder already has.
    if (step === 'deposit' && sharedDelegation?.some((read) => read.status !== 'success') !== false)
      return
    const call =
      step === 'redeem'
        ? getWriteContractParams(
            prepareVoteLockRedeem({ chainId: chainId as never, stToken: oldVoteLock, shares, account })
          )
        : step === 'approve'
          ? lockAmount === undefined
            ? undefined
            : getWriteContractParams(
                prepareErc20Approval({ chainId: chainId as never, token: underlying, spender: newVoteLock, amount: lockAmount })
              )
          : lockAmount === undefined || lockAmount === 0n
            ? undefined
            : deposit.type === 'deposit'
              ? getWriteContractParams(
                  prepareVoteLockDeposit({ chainId: chainId as never, stToken: newVoteLock, amount: lockAmount, receiver: account })
                )
              : {
                  chainId,
                  address: newVoteLock,
                  abi: sharedVaultAbi,
                  functionName: 'depositAndDelegate' as const,
                  args: [lockAmount, deposit.delegatee, deposit.optimisticDelegatee] as const,
                }
    if (!call) return
    setRejected(false)
    setFailed(undefined)
    const submitted = step
    // Captured before sending: some Safes only resolve once the transaction has executed.
    const baseline =
      submitted === 'redeem' ? walletBalance : submitted === 'deposit' ? newShares : undefined
    if (isSafe && submitted !== 'approve' && baseline === undefined) return
    writeContract(call as never, {
      onSuccess: (hash) =>
        update((current) => ({
          ...current,
          pending: {
            step: submitted,
            hash,
            ...(isSafe ? { viaSafe: true, ...(baseline !== undefined ? { baseline } : {}) } : {}),
          },
          ...(submitted === 'redeem' && oldDelegate ? { delegate: oldDelegate } : {}),
          ...(submitted === 'deposit' ? { locked: lockAmount } : {}),
        })),
      onError: () => setRejected(true),
    })
  }

  return {
    record,
    step,
    needsApproval,
    shares,
    estimate,
    lockAmount,
    received: redeemed,
    delegatee,
    isSigning,
    isConfirming: !!record.pending,
    isWaitingForSafe: !!safePending,
    // A Safe transaction rejected in the Safe never confirms, so the holder can drop it and sign again.
    cancelSafePending: () => update(({ pending: _, ...rest }) => rest),
    isRecovering: recovering,
    nothingToLock,
    rejected,
    failed,
    submit,
    acknowledge: () => update((current) => ({ ...current, acknowledged: true })),
  }
}

export type MigrationFlow = ReturnType<typeof useMigrationFlow>
