import { Trans, t } from '@lingui/macro'
import { Button } from 'components'
import { TransactionButtonContainer } from '@/components/old/button/TransactionButton'
import CheckCircleIcon from 'components/icons/CheckCircleIcon'
import GasIcon from 'components/icons/GasIcon'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import ApprovalStatus from 'components/transaction-modal/ApprovalStatus'
import useApproveAndExecute from 'hooks/useApproveAndExecute'
import { useStaticGasEstimate } from 'hooks/useGasEstimate'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { Box, Link, Spinner, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { stakeAllowanceAtom, stakeTransactionAtom } from './atoms'

const APPROVE_GAS_ESTIMATE = 400000
const STAKE_AND_DELEGATE_GAS_ESTIMATE = 350000
const STAKE_GAS_ESTIMATE = 300000

const GasEstimate = ({ gasLimit }: { gasLimit: number }) => {
  const [total] = useStaticGasEstimate([gasLimit])

  return (
    <Box variant="layout.verticalAlign" mb={2}>
      <Text>Estimated gas cost:</Text>
      <Box ml="auto" variant="layout.verticalAlign">
        <GasIcon />
        {total ? (
          <Text variant="bold" ml="1">
            ${formatCurrency(total, 3)}
          </Text>
        ) : (
          <Spinner size={16} />
        )}
      </Box>
    </Box>
  )
}

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
        <GasEstimate gasLimit={APPROVE_GAS_ESTIMATE} />
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
      <GasEstimate
        gasLimit={
          call?.functionName === 'stakeAndDelegate'
            ? STAKE_AND_DELEGATE_GAS_ESTIMATE
            : STAKE_GAS_ESTIMATE
        }
      />
      <Button disabled={!isReady} onClick={execute} fullWidth>
        {!isReady ? 'Preparing transaction' : 'Confirm Stake'}
      </Button>
      {errorMsg}
    </TransactionButtonContainer>
  )
}
export default ConfirmStakeButton
