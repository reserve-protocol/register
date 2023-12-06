import { t, Trans } from '@lingui/macro'
import TransactionButton from 'components/button/TransactionButton'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { memo } from 'react'
import { Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { useContractWrite } from 'wagmi'
import { usePrepareFinalizeWithdrawal } from '../hooks/usePrepareFinalizeWithdrawal'

type FinalizeWithdrawalButtonProps = {
  txHash: `0x${string}`
}

export const FinalizeWithdrawalButton = memo(function FinalizeWithdrawalButton({
  txHash,
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

  if (status === 'success') {
    return (
      <Text>
        <Trans>Funds moved</Trans>
      </Text>
    )
  }

  return (
    <TransactionButton
      loading={isLoading || isMining}
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
