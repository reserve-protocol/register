import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import TransactionButton from '@/components/old/button/TransactionButton'
import useContractWrite from '@/hooks/useContractWrite'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { parseUnits } from 'viem'
import { useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { stakingInputAtom, underlyingBalanceAtom } from './atoms'
import { walletAtom } from '@/state/atoms'

const SubmitUnstakeButton = () => {
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(indexDTFAtom)!.stToken!
  const input = useAtomValue(stakingInputAtom)
  const balance = useAtomValue(underlyingBalanceAtom)
  const amountToUnlock = parseUnits(input, stToken.token.decimals)
  const resetInput = useResetAtom(stakingInputAtom)

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

  const { data: delay } = useReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'unstakingDelay',
    address: stToken?.id,
    args: [],
  })

  const delayInDays = delay ? Number(delay) / 86400 : 0

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (receipt?.status === 'success') {
      resetInput()
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
            : `Begin ${delayInDays ? `${delayInDays}-day` : ''} unlock delay`
        }
        fullWidth
        error={validationError || error || txError}
      />
    </div>
  )
}

export default SubmitUnstakeButton
