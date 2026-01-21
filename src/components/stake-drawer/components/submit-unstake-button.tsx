import TransactionButton from '@/components/ui/transaction-button'
import { walletAtom } from '@/state/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { Address } from 'viem'
import { toast } from 'sonner'
import { safeParseEther } from '@/utils'
import {
  closeDrawerAtom,
  isValidUnstakeAmountAtom,
  stakingInputAtom,
  stTokenAtom,
} from '../atoms'
import StRSR from 'abis/StRSR'

const SubmitUnstakeButton = () => {
  const wallet = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)
  const stakingInput = useAtomValue(stakingInputAtom)
  const isValid = useAtomValue(isValidUnstakeAmountAtom)
  const setCloseDrawer = useSetAtom(closeDrawerAtom)
  const [isProcessing, setIsProcessing] = useState(false)

  const amount = stakingInput ? safeParseEther(stakingInput) : 0n
  const chainId = stToken?.chainId

  const {
    writeContract,
    isPending: isLoading,
    data: hash,
    error,
  } = useWriteContract()

  const write = () => {
    if (!stToken || !isValid || amount === 0n) return

    writeContract({
      address: stToken.stToken.address as Address,
      abi: StRSR,
      functionName: 'unstake',
      args: [amount],
      chainId: stToken.chainId,
    })
  }

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  useEffect(() => {
    if (receipt?.status === 'success') {
      setIsProcessing(true)
      toast.success('Unstaking initiated! You can withdraw your RSR after the delay period.')
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

    if (!isValid) {
      return 'Enter valid amount'
    }

    if (receipt?.status === 'success') {
      return 'Transaction confirmed'
    }

    return 'Unstake'
  }

  return (
    <div>
      <TransactionButton
        chain={chainId}
        disabled={
          !wallet ||
          !isValid ||
          receipt?.status === 'success' ||
          amount === 0n
        }
        loading={
          isProcessing ||
          (!receipt && (isLoading || !!hash || (hash && !receipt)))
        }
        loadingText={
          isProcessing
            ? 'Processing transaction...'
            : !!hash
              ? 'Confirming tx...'
              : 'Pending, sign in wallet'
        }
        onClick={write}
        text={getButtonText()}
        className="w-full"
        error={error || txError}
      />
    </div>
  )
}

export default SubmitUnstakeButton