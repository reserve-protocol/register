import { Trans, t } from '@lingui/macro'
import { Button } from 'components'
import { TransactionButtonContainer } from 'components/button/TransactionButton'
import CheckCircleIcon from 'components/icons/CheckCircleIcon'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import ApprovalStatus from 'components/transaction-modal/ApprovalStatus'
import useApproveAndExecute from 'hooks/useApproveAndExecute'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { Box, Link, Spinner, Text } from 'theme-ui'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { stakeAllowanceAtom, stakeTransactionAtom } from './atoms'

const ConfirmStakeButton = () => {
  const call = useAtomValue(stakeTransactionAtom)
  const allowance = useAtomValue(stakeAllowanceAtom)
  const chain = useAtomValue(chainIdAtom)

  const {
    execute,
    isReady,
    validatingAllowance,
    hasAllowance,
    isLoading,
    isApproved,
    error,
    approvalHash,
    executeHash,
    isConfirmed,
  } = useApproveAndExecute(call, allowance, 'Stake')

  const errorMsg = error ? (
    <Box mt={2} sx={{ textAlign: 'center' }}>
      <Text variant="error" mt={2}>
        {error}
      </Text>
    </Box>
  ) : null

  if (validatingAllowance) {
    return (
      <Box variant="layout.verticalAlign" sx={{ justifyContent: 'center' }}>
        <Spinner size={16} />
        <Text variant="strong" ml={3}>
          <Trans>Verifying allowance...</Trans>
        </Text>
      </Box>
    )
  }

  if (!hasAllowance && !isLoading && !isApproved) {
    return (
      <TransactionButtonContainer>
        <Button fullWidth onClick={execute} disabled={!isReady}>
          {!isReady ? 'Preparing approval' : 'Approve use of RSR'}
        </Button>
        {errorMsg}
      </TransactionButtonContainer>
    )
  }

  if (isLoading || executeHash) {
    const getStatusText = () => {
      if ((!hasAllowance && isApproved) || hasAllowance) {
        if (!isReady) {
          return t`Verifying transaction...`
        }

        if (!executeHash) {
          return t`Proceed in wallet`
        }

        return 'Submitted!'
      }

      return ''
    }

    const statusText = getStatusText()

    return (
      <Box mt="4">
        {allowance && (isApproved || !hasAllowance) && (
          <ApprovalStatus
            allowance={allowance}
            hash={approvalHash}
            success={isApproved}
          />
        )}
        <Box variant="layout.verticalAlign">
          <TransactionsIcon />
          <Box ml="2" mr="auto">
            <Text variant="bold" sx={{ display: 'block' }}>
              {!executeHash ? 'Confirm Stake' : 'Transaction submitted'}
            </Text>
            {executeHash ? (
              <Link
                target="_blank"
                href={getExplorerLink(
                  executeHash,
                  chain,
                  ExplorerDataType.TRANSACTION
                )}
              >
                <Trans>View in explorer</Trans>
              </Link>
            ) : (
              <Text>{statusText}</Text>
            )}
          </Box>
          {!!statusText && !isConfirmed && <Spinner size={16} />}
          {isConfirmed && <CheckCircleIcon />}
        </Box>
      </Box>
    )
  }

  return (
    <TransactionButtonContainer>
      <Button disabled={!isReady} onClick={execute} fullWidth>
        {!isReady ? 'Preparing transaction' : 'Confirm Stake'}
      </Button>
      {errorMsg}
    </TransactionButtonContainer>
  )
}
export default ConfirmStakeButton
