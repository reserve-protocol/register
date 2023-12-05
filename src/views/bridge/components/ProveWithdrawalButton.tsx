import { Button } from 'components'
import useSwitchChain from 'hooks/useSwitchChain'
import { Dispatch, memo, SetStateAction, useCallback } from 'react'
import { ChainId } from 'utils/chains'
import { useContractWrite, useNetwork } from 'wagmi'
import { usePrepareProveWithdrawal } from '../hooks/usePrepareProveWithdrawal'

type ProveWithdrawalButtonProps = {
  txHash: `0x${string}`
  setProveTxHash: Dispatch<SetStateAction<`0x${string}` | undefined>>
  blockNumberOfLatestL2OutputProposal?: bigint
}

export const ProveWithdrawalButton = memo(function ProveWithdrawalButton({
  txHash,
  setProveTxHash,
  blockNumberOfLatestL2OutputProposal,
}: ProveWithdrawalButtonProps) {
  const proveWithdrawalConfig = usePrepareProveWithdrawal(
    txHash,
    blockNumberOfLatestL2OutputProposal
  )
  const { writeAsync: submitProof } = useContractWrite(proveWithdrawalConfig)
  const switchChain = useSwitchChain()

  const { chain } = useNetwork()

  const handleSwitchToL1 = useCallback(() => {
    switchChain(ChainId.Mainnet)
  }, [switchChain])

  const handleProveWithdrawal = useCallback(() => {
    void (async () => {
      try {
        const proveResult = await submitProof?.()
        if (proveResult?.hash) {
          const proveTxHash = proveResult.hash
          setProveTxHash(proveTxHash)
        }
      } catch {}
    })()
  }, [setProveTxHash, submitProof])

  const isConnectedToL1 = chain?.id === ChainId.Mainnet

  return (
    <Button
      onClick={isConnectedToL1 ? handleProveWithdrawal : handleSwitchToL1}
      small
    >
      {isConnectedToL1 ? 'Verify' : 'Switch to L1'}
    </Button>
  )
})
