import { Button } from '@/components/ui/button'
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
import Spinner from '@/components/ui/spinner'
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
  errorMessageAtom,
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
  const setErrorMessage = useSetAtom(errorMessageAtom)
  const delegationLoading = useAtomValue(delegationLoadingAtom)
  const { address } = useAccount()
  const [hasApprovedOnce, setHasApprovedOnce] = useState(false)

  const amount = stakingInput ? safeParseEther(stakingInput) : 0n
  const needsValidDelegate = !isLegacy && delegate !== currentDelegate
  const isValidDelegate = !needsValidDelegate || (delegate && isAddress(delegate, { strict: false }))

  // Check RSR allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: stToken?.chainId ? RSR_ADDRESS[stToken.chainId] as Address : undefined,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && stToken ? [address, stToken.stToken.address as Address] : undefined,
    query: {
      enabled: !!address && !!stToken,
    },
  })

  const needsApproval = allowance !== undefined && amount > 0n && allowance < amount

  // Approve transaction
  const {
    writeContract: approve,
    isPending: isApproving,
    data: approveHash,
    error: approveError,
  } = useWriteContract()

  const {
    isSuccess: isApproved,
    error: approveReceiptError
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  // Stake transaction
  const {
    writeContract: stake,
    isPending: isStaking,
    data: stakeHash,
    error: stakeError,
  } = useWriteContract()

  const {
    isSuccess: isStaked,
    error: stakeReceiptError
  } = useWaitForTransactionReceipt({
    hash: stakeHash,
  })

  const handleApprove = () => {
    if (!stToken || amount === 0n) return

    setErrorMessage('')
    approve({
      address: RSR_ADDRESS[stToken.chainId] as Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [stToken.stToken.address as Address, amount],
      chainId: stToken.chainId,
    })
  }

  const handleStake = () => {
    if (!stToken || !isValid || delegationLoading || !delegate) return

    setErrorMessage('')

    const shouldUseStakeAndDelegate = !isLegacy && delegate !== currentDelegate

    if (shouldUseStakeAndDelegate) {
      stake({
        address: stToken.stToken.address as Address,
        abi: StRSRVotes,
        functionName: 'stakeAndDelegate',
        args: [amount, delegate as Address],
        chainId: stToken.chainId,
      })
    } else {
      stake({
        address: stToken.stToken.address as Address,
        abi: StRSR,
        functionName: 'stake',
        args: [amount],
        chainId: stToken.chainId,
      })
    }
  }

  useEffect(() => {
    setErrorMessage('')
  }, [stakingInput, setErrorMessage])

  useEffect(() => {
    if (isApproved) {
      setHasApprovedOnce(true)
      refetchAllowance()
    }
  }, [isApproved, refetchAllowance])

  useEffect(() => {
    if (isStaked) {
      toast.success('RSR staked successfully!')
      setCloseDrawer(true)
    }
  }, [isStaked, setCloseDrawer])

  const extractErrorMessage = (error: any): string => {
    if (!error) return ''

    const errorString = error.toString()

    if (errorString.includes('User rejected')) {
      return 'Transaction was rejected'
    }
    if (errorString.includes('insufficient funds')) {
      return 'Insufficient funds for gas'
    }

    const revertMatch = errorString.match(/reverted with the following reason:\s*([^\.]+)/)
    if (revertMatch) {
      return revertMatch[1].trim()
    }

    const reasonMatch = errorString.match(/reason="([^"]+)"/)
    if (reasonMatch) {
      return reasonMatch[1]
    }

    return 'Transaction failed. Please try again'
  }

  useEffect(() => {
    const errorToShow = approveError || approveReceiptError || stakeError || stakeReceiptError
    if (errorToShow) {
      setErrorMessage(extractErrorMessage(errorToShow))
    }
  }, [approveError, approveReceiptError, stakeError, stakeReceiptError, setErrorMessage])

  const getButtonState = () => {
    if (!wallet) {
      return { disabled: true, label: 'Connect wallet' }
    }

    if (delegationLoading) {
      return { disabled: true, label: 'Loading...', loading: true }
    }

    if (!isValid) {
      return { disabled: true, label: 'Enter valid amount' }
    }

    if (!checkbox) {
      return { disabled: true, label: 'Accept unstake delay' }
    }

    if (needsValidDelegate && !isValidDelegate) {
      return { disabled: true, label: 'Invalid delegate address' }
    }

    if (isApproving) {
      return { disabled: true, label: 'Approving RSR...', loading: true }
    }

    if (approveHash && !isApproved && !approveReceiptError) {
      return { disabled: true, label: 'Confirming approval...', loading: true }
    }

    if (needsApproval && !hasApprovedOnce) {
      return { disabled: false, label: 'Approve RSR' }
    }

    if (isStaking) {
      return { disabled: true, label: 'Staking...', loading: true }
    }

    if (stakeHash && !isStaked && !stakeReceiptError) {
      return { disabled: true, label: 'Confirming stake...', loading: true }
    }

    return { disabled: false, label: 'Stake RSR' }
  }

  const { disabled, label, loading } = getButtonState()

  const handleClick = () => {
    if (needsApproval && !hasApprovedOnce) {
      handleApprove()
    } else {
      handleStake()
    }
  }

  return (
    <Button
      className="w-full h-12"
      disabled={disabled}
      onClick={handleClick}
    >
      {loading && <Spinner className="mr-2" />}
      {label}
    </Button>
  )
}

export default SubmitStakeButton