import { t } from '@lingui/macro'
import TransactionButton from 'components/button/TransactionButton'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { Dispatch, memo, SetStateAction, useEffect } from 'react'
import { useContractWrite } from 'wagmi'
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
  const {
    write: submitProof,
    isLoading,
    data,
  } = useContractWrite(proveWithdrawalConfig)

  const { isMining, status } = useWatchTransaction({
    hash: data?.hash,
    label: 'Finalize base withdraw',
  })

  useEffect(() => {
    if (status === 'success') {
      setProveTxHash(data?.hash)
    }
  }, [status])

  return (
    <TransactionButton
      loading={isLoading || isMining}
      mining={isMining}
      small
      text={t`Verify`}
      onClick={submitProof}
    />
  )
})
