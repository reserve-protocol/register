import TransactionButton from '@/components/ui/transaction-button'
import { walletAtom } from '@/state/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
} from 'wagmi'
import { Address, isAddress } from 'viem'
import { toast } from 'sonner'
import { safeParseEther } from '@/utils'
import {
  closeDrawerAtom,
  isValidStakeAmountAtom,
  stakingInputAtom,
  stTokenAtom,
  delegateAtom,
  currentDelegateAtom,
  isLegacyAtom,
  unstakeCheckboxAtom,
  delegationLoadingAtom,
} from '../atoms'
import { RSR_ADDRESS } from '@/utils/addresses'
import { erc20Abi } from 'viem'
import StRSR from 'abis/StRSR'
import StRSRVotes from 'abis/StRSRVotes'

const SubmitStakeButton = () => {
  const wallet = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)
  const stakingInput = useAtomValue(stakingInputAtom)
  const isValid = useAtomValue(isValidStakeAmountAtom)
  const setCloseDrawer = useSetAtom(closeDrawerAtom)
  const delegate = useAtomValue(delegateAtom)
  const currentDelegate = useAtomValue(currentDelegateAtom)
  const isLegacy = useAtomValue(isLegacyAtom)
  const checkbox = useAtomValue(unstakeCheckboxAtom)
  const delegationLoading = useAtomValue(delegationLoadingAtom)
  const { address } = useAccount()
  const [hasApprovedOnce, setHasApprovedOnce] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const amount = stakingInput ? safeParseEther(stakingInput) : 0n
  const needsValidDelegate = !isLegacy && delegate !== currentDelegate
  const isValidDelegate = !needsValidDelegate || (delegate && isAddress(delegate, { strict: false }))
  const chainId = stToken?.chainId

  // Check RSR allowance
  const {
    data: allowance,
    refetch: refetchAllowance,
    isLoading: validatingAllowance
  } = useReadContract({
    address: stToken?.chainId ? RSR_ADDRESS[stToken.chainId] as Address : undefined,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && stToken ? [address, stToken.stToken.address as Address] : undefined,
    chainId,
    query: {
      enabled: !!address && !!stToken && isValid && checkbox,
    },
  })

  const hasAllowance = (allowance || 0n) >= amount

  // Approve transaction
  const {
    writeContract: writeApprove,
    isPending: approving,
    data: approvalHash,
    error: approvalError,
  } = useWriteContract()

  const approve = () => {
    if (!stToken || amount === 0n || hasAllowance) return

    writeApprove({
      address: RSR_ADDRESS[stToken.chainId] as Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [stToken.stToken.address as Address, amount],
      chainId: stToken.chainId,
    })
  }

  const {
    data: approvalReceipt,
    error: approvalTxError
  } = useWaitForTransactionReceipt({
    hash: approvalHash,
    chainId,
  })

  const readyToSubmit = hasAllowance || approvalReceipt?.status === 'success'

  // Stake transaction
  const {
    writeContract,
    isPending: isLoading,
    data: hash,
    error,
  } = useWriteContract()

  const write = () => {
    if (!stToken || !readyToSubmit || !isValid || delegationLoading || !delegate) return

    const shouldUseStakeAndDelegate = !isLegacy && delegate !== currentDelegate

    if (shouldUseStakeAndDelegate) {
      writeContract({
        address: stToken.stToken.address as Address,
        abi: StRSRVotes,
        functionName: 'stakeAndDelegate',
        args: [amount, delegate as Address],
        chainId: stToken.chainId,
      })
    } else {
      writeContract({
        address: stToken.stToken.address as Address,
        abi: StRSR,
        functionName: 'stake',
        args: [amount],
        chainId: stToken.chainId,
      })
    }
  }

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  useEffect(() => {
    if (approvalReceipt?.status === 'success') {
      setHasApprovedOnce(true)
      refetchAllowance()
    }
  }, [approvalReceipt, refetchAllowance])

  useEffect(() => {
    if (receipt?.status === 'success') {
      setIsProcessing(true)
      toast.success('RSR staked successfully!')
      const timer = setTimeout(() => {
        setCloseDrawer(true)
        setIsProcessing(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [receipt, setCloseDrawer])

  // Button text logic
  const getButtonText = () => {
    if (!wallet) {
      return 'Connect wallet'
    }

    if (delegationLoading) {
      return 'Loading...'
    }

    if (!isValid) {
      return 'Enter valid amount'
    }

    if (!checkbox) {
      return 'Accept unstake delay'
    }

    if (needsValidDelegate && !isValidDelegate) {
      return 'Invalid delegate address'
    }

    if (receipt?.status === 'success') {
      return 'Transaction confirmed'
    }

    if (readyToSubmit) {
      return 'Stake RSR'
    }

    return 'Approve RSR'
  }

  return (
    <div>
      <TransactionButton
        chain={chainId}
        disabled={
          !wallet ||
          delegationLoading ||
          !isValid ||
          !checkbox ||
          (needsValidDelegate && !isValidDelegate) ||
          receipt?.status === 'success' ||
          amount === 0n
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
              : !!approvalHash
                ? 'Confirming approval...'
                : 'Pending, sign in wallet'
        }
        onClick={readyToSubmit ? write : approve}
        text={getButtonText()}
        fullWidth
        error={
          readyToSubmit
            ? error || txError
            : approvalError || approvalTxError
        }
      />
    </div>
  )
}

export default SubmitStakeButton