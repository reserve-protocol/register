import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { TransactionButtonContainer } from 'components/button/TransactionButton'
import CheckCircleIcon from 'components/icons/CheckCircleIcon'
import GasIcon from 'components/icons/GasIcon'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, Link, Spinner, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { unstakeDelayAtom } from 'views/staking/atoms'
import { UsePrepareContractWriteConfig } from 'wagmi'
import { unstakeGasEstimateAtom, unstakeTransactionAtom } from './atoms'

const GasEstimate = () => {
  const estimate = useAtomValue(unstakeGasEstimateAtom)

  return (
    <Box variant="layout.verticalAlign" mt={2}>
      <Text>Estimated gas cost:</Text>
      <Box ml="auto" variant="layout.verticalAlign">
        <GasIcon />
        {estimate ? (
          <Text variant="bold" ml="1">
            ${formatCurrency(estimate, 3)}
          </Text>
        ) : (
          <Spinner size={16} />
        )}
      </Box>
    </Box>
  )
}

const ConfirmUnstakeButton = () => {
  const chain = useAtomValue(chainIdAtom)
  const tx: UsePrepareContractWriteConfig | undefined = useAtomValue(
    unstakeTransactionAtom
  )
  const delay = useAtomValue(unstakeDelayAtom)
  const { write, isReady, isLoading, hash, error } = useContractWrite(tx)
  const { status } = useWatchTransaction({
    hash,
    label: 'Unstake',
  })

  const errorMsg = useMemo(() => {
    let errorText = null

    if (error?.message.includes('User rejected the request')) {
      errorText = 'Transaction rejected'
    }

    if (error || status === 'error') {
      errorText = 'Execution failed'
    }

    return errorText
  }, [error, status])

  if (!errorMsg && (isLoading || hash)) {
    return (
      <Box variant="layout.verticalAlign">
        <TransactionsIcon />
        <Box ml="2" mr="auto">
          <Text variant="bold" sx={{ display: 'block' }}>
            {status === 'success' && `${delay} cooldown started`}
            {hash && status !== 'success' && 'Transaction submitted'}
            {!hash && 'Confirm Unstake'}
          </Text>
          {hash ? (
            <Link
              target="_blank"
              href={getExplorerLink(hash, chain, ExplorerDataType.TRANSACTION)}
            >
              <Trans>View in explorer</Trans>
            </Link>
          ) : (
            <Text>Proceed in wallet</Text>
          )}
        </Box>
        {status !== 'success' ? <Spinner size={16} /> : <CheckCircleIcon />}
      </Box>
    )
  }

  return (
    <TransactionButtonContainer>
      <Button disabled={!isReady} onClick={write} fullWidth>
        {!isReady ? 'Preparing transaction' : 'Begin unstaking process'}
      </Button>
      {!!errorMsg && (
        <Box mt={2} sx={{ textAlign: 'center' }}>
          <Text variant="error" mt={2}>
            {errorMsg}
          </Text>
        </Box>
      )}
      <GasEstimate />
    </TransactionButtonContainer>
  )
}

export default ConfirmUnstakeButton
