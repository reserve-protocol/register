import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import TransactionButton from '@/components/old/button/TransactionButton'
import { walletAtom } from '@/state/atoms'
import { portfolioSidebarOpenAtom } from '@/views/portfolio/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { parseUnits } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import {
  stakingInputAtom,
  stakingSidebarOpenAtom,
  stTokenAtom,
  unlockBalanceRawAtom,
  unlockDelayAtom,
} from '../atoms'

const SubmitUnlockButton = () => {
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)!
  const input = useAtomValue(stakingInputAtom)
  const balance = useAtomValue(unlockBalanceRawAtom)
  const amountToUnlock = parseUnits(input, stToken?.token.decimals)
  const unlockDelay = useAtomValue(unlockDelayAtom)
  const resetInput = useResetAtom(stakingInputAtom)
  const setPortfolioSidebarOpen = useSetAtom(portfolioSidebarOpenAtom)
  const setStakingSidebarOpen = useSetAtom(stakingSidebarOpenAtom)
  const chainId = stToken?.chainId
  const [isProcessing, setIsProcessing] = useState(false)

  const readyToSubmit =
    !!account && !!balance && amountToUnlock > 0n && amountToUnlock <= balance

  const {
    writeContract,
    data: hash,
    isPending: isLoading,
    error,
  } = useWriteContract()

  const write = () => {
    if (!account || !readyToSubmit || !stToken?.id) return

    writeContract({
      abi: dtfIndexStakingVault,
      functionName: 'withdraw',
      address: stToken?.id,
      args: [amountToUnlock, account, account],
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
        disabled={receipt?.status === 'success' || !readyToSubmit}
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
        text={
          receipt?.status === 'success'
            ? 'Transaction confirmed'
            : `Begin ${unlockDelay ? `${unlockDelay}-day` : ''} unlock delay`
        }
        fullWidth
        error={error || txError}
      />
    </div>
  )
}

export default SubmitUnlockButton
