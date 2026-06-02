import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import TransactionButton from '@/components/ui/transaction-button'
import { walletAtom } from '@/state/atoms'
import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { erc20Abi, parseUnits } from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import {
  lockCheckboxAtom,
  stakingInputAtom,
  stakingSidebarOpenAtom,
  stTokenAtom,
  underlyingBalanceAtom,
  updateStTokenSupplyAtom,
} from '../atoms'
import useRefreshVoteLockQueries, {
  VOTE_LOCK_SUBGRAPH_REFRESH_DELAY,
} from '../use-refresh-vote-lock-queries'

const SubmitLockButton = () => {
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)!
  const input = useAtomValue(stakingInputAtom)
  const balance = useAtomValue(underlyingBalanceAtom)
  const amountToLock = parseUnits(input, stToken?.underlying.decimals)
  const checkbox = useAtomValue(lockCheckboxAtom)
  const resetInput = useResetAtom(stakingInputAtom)
  const setStakingSidebarOpen = useSetAtom(stakingSidebarOpenAtom)
  const updateStTokenSupply = useSetAtom(updateStTokenSupplyAtom)
  const queryClient = useQueryClient()
  const chainId = stToken?.chainId
  const [isProcessing, setIsProcessing] = useState(false)
  const pendingSupplyDelta = useRef(0n)
  const processedReceiptHash = useRef<string>()
  const processingTimer = useRef<ReturnType<typeof setTimeout>>()
  const {
    invalidateCurrentVoteLockRpcQueries,
    scheduleCurrentVoteLockSubgraphRefresh,
  } = useRefreshVoteLockQueries({ account, stToken })

  useEffect(() => {
    return () => {
      if (processingTimer.current) clearTimeout(processingTimer.current)
    }
  }, [])

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
    query: { enabled: !!account },
  })

  const hasAllowance = (allowance || 0n) >= amountToLock

  const { data: sharesToMint } = useReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'previewDeposit',
    address: stToken?.id,
    args: [amountToLock],
    chainId,
    query: { enabled: amountToLock > 0n && !!stToken?.id },
  })

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
      address: stToken?.underlying.address,
      functionName: 'approve',
      args: [stToken?.id, amountToLock],
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
    if (!account || !readyToSubmit || !stToken?.id) return

    pendingSupplyDelta.current = sharesToMint ?? amountToLock

    writeContract({
      abi: dtfIndexStakingVault,
      functionName: 'depositAndDelegate',
      address: stToken?.id,
      args: [amountToLock],
      chainId,
    })
  }

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  useEffect(() => {
    if (receipt?.status !== 'success' || !receipt.transactionHash) return
    if (processedReceiptHash.current === receipt.transactionHash) return

    processedReceiptHash.current = receipt.transactionHash
    updateStTokenSupply(pendingSupplyDelta.current)
    invalidateCurrentVoteLockRpcQueries()
    scheduleCurrentVoteLockSubgraphRefresh()
    setIsProcessing(true)
    processingTimer.current = setTimeout(() => {
      resetInput()
      setStakingSidebarOpen(false)
      toast.success('Vote lock successful', { duration: 8000 })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      setIsProcessing(false)
      processingTimer.current = undefined
    }, VOTE_LOCK_SUBGRAPH_REFRESH_DELAY)
  }, [
    receipt?.status,
    receipt?.transactionHash,
    resetInput,
    setStakingSidebarOpen,
    queryClient,
    updateStTokenSupply,
    invalidateCurrentVoteLockRpcQueries,
    scheduleCurrentVoteLockSubgraphRefresh,
  ])

  return (
    <div>
      <TransactionButton
        chain={chainId}
        disabled={
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
