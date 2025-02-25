import { t, Trans } from '@lingui/macro'
import TransactionButton from '@/components/old/button/TransactionButton'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { memo, useCallback } from 'react'
import { Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { usePrepareFinalizeWithdrawal } from '../hooks/usePrepareFinalizeWithdrawal'
import { useWriteContract } from 'wagmi'

type FinalizeWithdrawalButtonProps = {
  txHash: `0x${string}`
}

export const FinalizeWithdrawalButton = memo(function FinalizeWithdrawalButton({
  txHash,
}: FinalizeWithdrawalButtonProps) {
  const proveWithdrawalConfig = usePrepareFinalizeWithdrawal(txHash)
  const { writeContract, isPending, data } = useWriteContract()

  const finalizeWithdrawal = useCallback(() => {
    if (proveWithdrawalConfig?.request) {
      writeContract(proveWithdrawalConfig.request)
    }
  }, [writeContract, proveWithdrawalConfig])

  const { isMining, status } = useWatchTransaction({
    hash: data,
    label: 'Finalize base withdraw',
  })

  if (status === 'success') {
    return (
      <Text>
        <Trans>Funds moved</Trans>
      </Text>
    )
  }

  return (
    <TransactionButton
      loading={isPending || isMining}
      mining={isMining}
      variant="primary"
      chain={ChainId.Mainnet}
      small
      sx={{ width: ['100%', 'auto'] }}
      text={t`Complete`}
      onClick={finalizeWithdrawal}
    />
  )
})
