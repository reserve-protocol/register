import { t, Trans } from '@lingui/macro'
import TransactionButton from 'components/button/TransactionButton'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { memo } from 'react'
import { Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { useContractWrite } from 'wagmi'
import { usePrepareProveWithdrawal } from '../hooks/usePrepareProveWithdrawal'

type ProveWithdrawalButtonProps = {
  txHash: `0x${string}`
  blockNumberOfLatestL2OutputProposal?: bigint
}

export const ProveWithdrawalButton = memo(function ProveWithdrawalButton({
  txHash,
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
    label: 'Verify base withdraw',
  })

  if (status === 'success') {
    return (
      <Text>
        <Trans>Verifying</Trans>
      </Text>
    )
  }

  return (
    <TransactionButton
      loading={isLoading || isMining}
      mining={isMining}
      chain={ChainId.Mainnet}
      sx={{ width: ['100%', 'auto'] }}
      small
      text={t`Verify`}
      onClick={submitProof}
    />
  )
})
