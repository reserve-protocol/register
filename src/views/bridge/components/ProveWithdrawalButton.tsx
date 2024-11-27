import { t, Trans } from '@lingui/macro'
import TransactionButton from 'components/button/TransactionButton'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { memo, useCallback } from 'react'
import { Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { useContractWrite, useWriteContract } from 'wagmi'
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

  const { writeContract, isPending, data } = useWriteContract()

  const submitProof = useCallback(() => {
    if (proveWithdrawalConfig?.request) {
      writeContract(proveWithdrawalConfig.request)
    }
  }, [writeContract, proveWithdrawalConfig])

  const { isMining, status } = useWatchTransaction({
    hash: data,
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
      loading={isPending || isMining}
      mining={isMining}
      chain={ChainId.Mainnet}
      sx={{ width: ['100%', 'auto'] }}
      small
      text={t`Verify`}
      onClick={submitProof}
    />
  )
})
