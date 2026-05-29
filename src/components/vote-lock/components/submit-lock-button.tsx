import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import TransactionButton from '@/components/ui/transaction-button'
import { walletAtom } from '@/state/atoms'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Address, erc20Abi, getAddress, isAddress, parseUnits } from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import {
  currentDelegateAtom,
  delegateAtom,
  lockCheckboxAtom,
  stakingInputAtom,
  stTokenAtom,
  underlyingBalanceAtom,
  closeDrawerAtom,
} from '../atoms'
import useIsComplianceRestricted from '@/hooks/use-is-compliance-restricted'

export const DelegateButton = () => {
  const { t } = useLingui()
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)!
  const delegate = useAtomValue(delegateAtom)
  const chainId = stToken?.chainId
  const isValidDelegate = isAddress(delegate, { strict: false })
  const setCurrentDelegate = useSetAtom(currentDelegateAtom)

  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const write = () => {
    if (!account || !isValidDelegate || !stToken?.id) return

    writeContract({
      abi: dtfIndexStakingVault,
      functionName: 'delegate',
      address: stToken?.id as `0x${string}`,
      args: [isValidDelegate ? getAddress(delegate) : account],
      chainId,
    })
  }

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  useEffect(() => {
    if (receipt?.status === 'success') {
      setCurrentDelegate(delegate)
    }
  }, [receipt, delegate, setCurrentDelegate])

  return (
    <div>
      <TransactionButton
        chain={chainId}
        disabled={!account || !isValidDelegate}
        loading={isPending || !!hash || (hash && !receipt)}
        loadingText={!!hash ? t`Confirming tx...` : t`Pending, sign in wallet`}
        onClick={write}
        text={t`Delegate ${stToken?.underlying.symbol}`}
        className="w-full"
        error={error || txError}
      />
    </div>
  )
}

const SubmitLockButton = () => {
  const { t } = useLingui()
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)!
  const input = useAtomValue(stakingInputAtom)
  const balance = useAtomValue(underlyingBalanceAtom)
  const amountToLock = parseUnits(input, stToken?.underlying.decimals)
  const checkbox = useAtomValue(lockCheckboxAtom)
  const delegate = useAtomValue(delegateAtom)
  const resetInput = useResetAtom(stakingInputAtom)
  const setShouldClose = useSetAtom(closeDrawerAtom)
  const chainId = stToken?.chainId
  const [isProcessing, setIsProcessing] = useState(false)
  const isRestricted = useIsComplianceRestricted()

  const isValidDelegate = isAddress(delegate, { strict: false })
  const isSelfDelegate = delegate === account

  const {
    data: allowance,
    isLoading: validatingAllowance,
    error: allowanceError,
  } = useReadContract({
    abi: erc20Abi,
    functionName: 'allowance',
    address: stToken?.underlying.address as `0x${string}`,
    args: [account!, stToken?.id as `0x${string}`],
    chainId,
    query: { enabled: !!account && isValidDelegate },
  })

  const hasAllowance = (allowance || 0n) >= amountToLock

  const {
    writeContract: writeApprove,
    data: approvalHash,
    isPending: approving,
    error: approvalError,
  } = useWriteContract()

  const approve = () => {
    if (
      !stToken?.underlying.address ||
      !stToken?.id ||
      hasAllowance ||
      !balance
    )
      return

    writeApprove({
      abi: erc20Abi,
      address: stToken?.underlying.address as `0x${string}`,
      functionName: 'approve',
      args: [stToken?.id as `0x${string}`, amountToLock],
      chainId,
    })
  }

  const { data: approvalReceipt, error: approvalTxError } =
    useWaitForTransactionReceipt({
      hash: approvalHash,
      chainId,
    })

  const readyToSubmit = hasAllowance || approvalReceipt?.status === 'success'

  const {
    writeContract,
    data: hash,
    isPending: isLoading,
    error,
  } = useWriteContract()

  const write = () => {
    if (!account || !readyToSubmit || !isValidDelegate || !stToken?.id) return

    writeContract({
      abi: dtfIndexStakingVault,
      functionName: isSelfDelegate ? 'depositAndDelegate' : 'deposit',
      address: stToken?.id as `0x${string}`,
      args: isSelfDelegate
        ? [amountToLock]
        : [amountToLock, account as Address],
      chainId,
    })
  }

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  useEffect(() => {
    if (receipt?.status === 'success') {
      setIsProcessing(true)
      const timer = setTimeout(() => {
        resetInput()
        setShouldClose(true)
        toast.success(t`Vote lock successful`, { duration: 8000 })
        setIsProcessing(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [receipt, resetInput, setShouldClose])

  return (
    <div>
      <TransactionButton
        chain={chainId}
        disabled={
          !isValidDelegate ||
          !checkbox ||
          receipt?.status === 'success' ||
          amountToLock === 0n ||
          isRestricted
        }
        loading={
          isProcessing ||
          (!receipt &&
            (readyToSubmit
              ? isLoading || !!hash || (hash && !receipt)
              : approving ||
              !!approvalHash ||
              validatingAllowance ||
              (approvalHash && !approvalReceipt)))
        }
        loadingText={
          isProcessing
            ? t`Processing transaction...`
            : !!hash
              ? t`Confirming tx...`
              : t`Pending, sign in wallet`
        }
        onClick={readyToSubmit ? write : approve}
        text={
          receipt?.status === 'success'
            ? t`Transaction confirmed`
            : readyToSubmit
              ? t`Vote lock ${stToken?.underlying.symbol}`
              : t`Approve use of ${stToken?.underlying.symbol}`
        }
        className="w-full"
        error={
          readyToSubmit
            ? error || txError
            : approvalError || approvalTxError || allowanceError
        }
      />
    </div>
  )
}

export default SubmitLockButton
