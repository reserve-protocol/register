import { t } from '@lingui/macro'
import TransactionButton from 'components/button/TransactionButton'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { Dispatch, memo, SetStateAction, useEffect } from 'react'
import { useContractWrite } from 'wagmi'
import { usePrepareFinalizeWithdrawal } from '../hooks/usePrepareFinalizeWithdrawal'

type FinalizeWithdrawalButtonProps = {
  txHash: `0x${string}`
  setFinalizeTxHash: Dispatch<SetStateAction<`0x${string}` | undefined>>
}

export const FinalizeWithdrawalButton = memo(function FinalizeWithdrawalButton({
  txHash,
  setFinalizeTxHash,
}: FinalizeWithdrawalButtonProps) {
  const proveWithdrawalConfig = usePrepareFinalizeWithdrawal(txHash)
  const {
    write: finalizeWithdrawal,
    isLoading,
    data,
  } = useContractWrite(proveWithdrawalConfig)
  const { isMining, status } = useWatchTransaction({
    hash: data?.hash,
    label: 'Finalize base withdraw',
  })

  useEffect(() => {
    if (status === 'success') {
      setFinalizeTxHash(data?.hash)
    }
  }, [status])

  return (
    <TransactionButton
      loading={isLoading || isMining}
      mining={isMining}
      small
      text={t`Complete`}
      onClick={finalizeWithdrawal}
    />
  )
})
