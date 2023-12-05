import useSwitchChain from 'hooks/useSwitchChain'
import { Dispatch, memo, SetStateAction, useCallback } from 'react'
import { ChainId } from 'utils/chains'
import { useContractWrite, useNetwork } from 'wagmi'
import { usePrepareFinalizeWithdrawal } from '../hooks/usePrepareFinalizeWithdrawal'
import { Button } from 'components'

type FinalizeWithdrawalButtonProps = {
  txHash: `0x${string}`
  setFinalizeTxHash: Dispatch<SetStateAction<`0x${string}` | undefined>>
}

export const FinalizeWithdrawalButton = memo(function FinalizeWithdrawalButton({
  txHash,
  setFinalizeTxHash,
}: FinalizeWithdrawalButtonProps) {
  const proveWithdrawalConfig = usePrepareFinalizeWithdrawal(txHash)
  const { writeAsync: finalizeWithdrawal } = useContractWrite(
    proveWithdrawalConfig
  )
  const switchChain = useSwitchChain()
  const { chain } = useNetwork()

  const handleSwitchToL1 = useCallback(() => {
    switchChain(ChainId.Mainnet)
  }, [switchChain])

  const handleProveWithdrawal = useCallback(() => {
    void (async () => {
      try {
        const finalizeResult = await finalizeWithdrawal?.()
        if (finalizeResult?.hash) {
          const finalizeTxHash = finalizeResult.hash
          setFinalizeTxHash(finalizeTxHash)
        }
      } catch {}
    })()
  }, [finalizeWithdrawal, setFinalizeTxHash])

  const isConnectedToL1 = chain?.id === ChainId.Mainnet

  return (
    <Button
      small
      onClick={isConnectedToL1 ? handleProveWithdrawal : handleSwitchToL1}
    >
      {isConnectedToL1 ? 'Complete' : 'Switch to L1'}
    </Button>
  )
})
