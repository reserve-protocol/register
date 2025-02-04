import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import TransactionButton from '@/components/old/button/TransactionButton'
import useContractWrite from '@/hooks/useContractWrite'
import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { parseUnits } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import {
  stakingInputAtom,
  stakingSidebarOpenAtom,
  underlyingBalanceAtom,
  unlockDelayAtom,
} from '../atoms'
import { portfolioSidebarOpenAtom } from '@/views/portfolio/atoms'

const SubmitUnlockButton = () => {
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(indexDTFAtom)!.stToken!
  const input = useAtomValue(stakingInputAtom)
  const balance = useAtomValue(underlyingBalanceAtom)
  const amountToUnlock = parseUnits(input, stToken.token.decimals)
  const unlockDelay = useAtomValue(unlockDelayAtom)
  const resetInput = useResetAtom(stakingInputAtom)
  const setPortfolioSidebarOpen = useSetAtom(portfolioSidebarOpenAtom)
  const setStakingSidebarOpen = useSetAtom(stakingSidebarOpenAtom)

  const readyToSubmit =
    !!account && !!balance && amountToUnlock > 0n && amountToUnlock <= balance

  const { isReady, gas, hash, validationError, error, isLoading, write } =
    useContractWrite({
      abi: dtfIndexStakingVault,
      functionName: 'withdraw',
      address: stToken.id,
      args: [amountToUnlock, account!, account!],
      query: { enabled: readyToSubmit },
    })

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (receipt?.status === 'success') {
      resetInput()
      setStakingSidebarOpen(false)
      setPortfolioSidebarOpen(true)
    }
  }, [receipt])

  return (
    <div>
      <TransactionButton
        disabled={receipt?.status === 'success' || !readyToSubmit || !isReady}
        gas={gas}
        loading={!receipt && (isLoading || !!hash || (hash && !receipt))}
        loadingText={!!hash ? 'Confirming tx...' : 'Pending, sign in wallet'}
        onClick={write}
        text={
          receipt?.status === 'success'
            ? 'Transaction confirmed'
            : `Begin ${unlockDelay ? `${unlockDelay}-day` : ''} unlock delay`
        }
        fullWidth
        error={validationError || error || txError}
      />
    </div>
  )
}

export default SubmitUnlockButton
