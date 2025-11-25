import { Button } from '@/components/ui/button'
import { walletAtom } from '@/state/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { Address } from 'viem'
import { toast } from 'sonner'
import Spinner from '@/components/ui/spinner'
import { safeParseEther } from '@/utils'
import {
  closeDrawerAtom,
  isValidUnstakeAmountAtom,
  stakingInputAtom,
  stTokenAtom,
  errorMessageAtom,
} from '../atoms'
import StRSR from 'abis/StRSR'

const SubmitUnstakeButton = () => {
  const wallet = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)
  const stakingInput = useAtomValue(stakingInputAtom)
  const isValid = useAtomValue(isValidUnstakeAmountAtom)
  const setCloseDrawer = useSetAtom(closeDrawerAtom)
  const setErrorMessage = useSetAtom(errorMessageAtom)

  const {
    writeContract,
    isPending,
    data: hash,
    error,
  } = useWriteContract()

  const { isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  })

  const handleUnstake = () => {
    if (!stToken || !isValid || !stakingInput) return

    setErrorMessage('')

    const amount = safeParseEther(stakingInput)

    writeContract({
      address: stToken.stToken.address as Address,
      abi: StRSR,
      functionName: 'unstake',
      args: [amount],
      chainId: stToken.chainId,
    })
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success('Unstaking initiated! You can withdraw your RSR after the delay period.')
      setCloseDrawer(true)
    }
  }, [isSuccess, setCloseDrawer])

  useEffect(() => {
    setErrorMessage('')
  }, [stakingInput, setErrorMessage])

  const extractErrorMessage = (error: any): string => {
    if (!error) return ''

    const errorString = error.toString()

    if (errorString.includes('User rejected')) {
      return 'Transaction was rejected'
    }
    if (errorString.includes('insufficient funds')) {
      return 'Insufficient funds for gas'
    }

    const revertMatch = errorString.match(/reverted with the following reason:\s*([^\.]+)/);
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
    const errorToShow = error || receiptError
    if (errorToShow) {
      setErrorMessage(extractErrorMessage(errorToShow))
    }
  }, [error, receiptError, setErrorMessage])

  const getButtonState = () => {
    if (!wallet) {
      return { disabled: true, label: 'Connect wallet' }
    }

    if (!isValid) {
      return { disabled: true, label: 'Enter valid amount' }
    }

    if (isPending) {
      return { disabled: true, label: 'Unstaking...', loading: true }
    }

    if (hash && !isSuccess && !receiptError) {
      return { disabled: true, label: 'Confirming...', loading: true }
    }

    return { disabled: false, label: 'Unstake' }
  }

  const { disabled, label, loading } = getButtonState()

  return (
    <Button
      className="w-full h-12"
      disabled={disabled}
      onClick={handleUnstake}
    >
      {loading && <Spinner className="mr-2" />}
      {label}
    </Button>
  )
}

export default SubmitUnstakeButton