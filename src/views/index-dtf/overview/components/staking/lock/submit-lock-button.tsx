import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import TransactionButton from '@/components/old/button/TransactionButton'
import useContractWrite from '@/hooks/useContractWrite'
import { walletAtom } from '@/state/atoms'
import { portfolioSidebarOpenAtom } from '@/views/portfolio/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { Address, erc20Abi, getAddress, isAddress, parseUnits } from 'viem'
import { useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import {
  currentDelegateAtom,
  delegateAtom,
  lockCheckboxAtom,
  stakingInputAtom,
  stakingSidebarOpenAtom,
  stTokenAtom,
  underlyingBalanceAtom,
} from '../atoms'

export const DelegateButton = () => {
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)!
  const delegate = useAtomValue(delegateAtom)
  const chainId = stToken?.chainId
  const isValidDelegate = isAddress(delegate, { strict: false })
  const setCurrentDelegate = useSetAtom(currentDelegateAtom)

  const { isReady, gas, hash, validationError, error, isLoading, write } =
    useContractWrite({
      abi: dtfIndexStakingVault,
      functionName: 'delegate',
      address: stToken?.id,
      args: [isValidDelegate ? getAddress(delegate) : account!],
      chainId,
      query: { enabled: !!account && isValidDelegate },
    })

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
        disabled={!account || !isValidDelegate || !isReady}
        gas={gas}
        loading={isLoading || !!hash || (hash && !receipt)}
        loadingText={!!hash ? 'Confirming tx...' : 'Pending, sign in wallet'}
        onClick={write}
        text={`Delegate ${stToken?.underlying.symbol}`}
        fullWidth
        error={validationError || error || txError}
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
  const setStakingSidebarOpen = useSetAtom(stakingSidebarOpenAtom)
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
    address: stToken?.underlying.address,
    args: [account!, stToken?.id],
    chainId,
    query: { enabled: !!account && isValidDelegate },
  })

  const hasAllowance = (allowance || 0n) >= amountToLock

  const {
    write: approve,
    isReady: approvalReady,
    gas: approvalGas,
    isLoading: approving,
    hash: approvalHash,
    error: approvalError,
    validationError: approvalValidationError,
  } = useContractWrite({
    abi: erc20Abi,
    address: stToken?.underlying.address,
    functionName: 'approve',
    args: [stToken?.id, amountToLock],
    chainId,
    query: {
      enabled:
        !hasAllowance &&
        !!balance &&
        amountToLock <= balance &&
        isValidDelegate,
    },
  })

  const { data: approvalReceipt, error: approvalTxError } =
    useWaitForTransactionReceipt({
      hash: approvalHash,
      chainId,
    })

  const readyToSubmit = hasAllowance || approvalReceipt?.status === 'success'

  const { isReady, gas, hash, validationError, error, isLoading, write } =
    useContractWrite({
      abi: dtfIndexStakingVault,
      functionName: isSelfDelegate ? 'depositAndDelegate' : 'deposit',
      address: stToken?.id,
      args: isSelfDelegate
        ? [amountToLock]
        : [amountToLock, account as Address],
      chainId,
      query: { enabled: !!account && readyToSubmit && isValidDelegate },
    })

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  useEffect(() => {
    if (receipt?.status === 'success') {
      setIsProcessing(true)
      const timer = setTimeout(() => {
        resetInput()
        setStakingSidebarOpen(false)
        setPortfolioSidebarOpen(true)
        setIsProcessing(false)
      }, 10000) // 10 seconds delay

      return () => clearTimeout(timer)
    }
  }, [receipt, resetInput, setStakingSidebarOpen, setPortfolioSidebarOpen])

  return (
    <div>
      <TransactionButton
        chain={chainId}
        disabled={
          !isValidDelegate ||
          !checkbox ||
          receipt?.status === 'success' ||
          amountToLock === 0n ||
          (readyToSubmit ? !isReady : !approvalReady)
        }
        gas={readyToSubmit ? gas : approvalGas}
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
            ? validationError || error || txError
            : approvalError ||
              approvalValidationError ||
              approvalTxError ||
              allowanceError
        }
      />
    </div>
  )
}

export default SubmitLockButton
