import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import TransactionButton from '@/components/old/button/TransactionButton'
import { walletAtom } from '@/state/atoms'
import { portfolioSidebarOpenAtom } from '@/views/portfolio/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
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

export const DelegateButton = () => {
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
        loadingText={!!hash ? 'Confirming tx...' : 'Pending, sign in wallet'}
        onClick={write}
        text={`Delegate ${stToken?.underlying.symbol}`}
        fullWidth
        error={error || txError}
      />
    </div>
  )
}

const SubmitLockButton = () => {
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)!
  const input = useAtomValue(stakingInputAtom)
  const balance = useAtomValue(underlyingBalanceAtom)
  const amountToLock = parseUnits(input, stToken?.underlying.decimals)
  const checkbox = useAtomValue(lockCheckboxAtom)
  const delegate = useAtomValue(delegateAtom)
  const resetInput = useResetAtom(stakingInputAtom)
  const setPortfolioSidebarOpen = useSetAtom(portfolioSidebarOpenAtom)
  const setShouldClose = useSetAtom(closeDrawerAtom)
  const chainId = stToken?.chainId
  const [isProcessing, setIsProcessing] = useState(false)

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
        // Close drawer and open portfolio sidebar
        setShouldClose(true)
        setPortfolioSidebarOpen(true)
        setIsProcessing(false)
      }, 10000) // 10 seconds delay

      return () => clearTimeout(timer)
    }
  }, [receipt, resetInput, setShouldClose, setPortfolioSidebarOpen])

  return (
    <div>
      <TransactionButton
        chain={chainId}
        disabled={
          !isValidDelegate ||
          !checkbox ||
          receipt?.status === 'success' ||
          amountToLock === 0n
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
            ? 'Processing transaction...'
            : !!hash
              ? 'Confirming tx...'
              : 'Pending, sign in wallet'
        }
        onClick={readyToSubmit ? write : approve}
        text={
          receipt?.status === 'success'
            ? 'Transaction confirmed'
            : readyToSubmit
              ? `Vote lock ${stToken?.underlying.symbol}`
              : `Approve use of ${stToken?.underlying.symbol}`
        }
        fullWidth
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
