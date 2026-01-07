import { Trans, t } from '@lingui/macro'
import { Button } from 'components'
import CheckCircleIcon from 'components/icons/CheckCircleIcon'
import GasIcon from 'components/icons/GasIcon'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import ApprovalStatus from 'components/transaction-modal/ApprovalStatus'
import useApproveAndExecute from 'hooks/useApproveAndExecute'
import { useStaticGasEstimate } from 'hooks/useGasEstimate'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { stakeAllowanceAtom, stakeTransactionAtom } from './atoms'
import { Skeleton } from '@/components/ui/skeleton'

const APPROVE_GAS_ESTIMATE = 400000
const STAKE_AND_DELEGATE_GAS_ESTIMATE = 350000
const STAKE_GAS_ESTIMATE = 300000

const GasEstimate = ({ gasLimit }: { gasLimit: number }) => {
  const [total] = useStaticGasEstimate([gasLimit])

  return (
    <div className="flex items-center mb-2">
      <span>Estimated gas cost:</span>
      <div className="ml-auto flex items-center">
        <GasIcon />
        {total ? (
          <span className="font-semibold ml-1">
            ${formatCurrency(total, 3)}
          </span>
        ) : (
          <Skeleton className="h-4 w-12 ml-1" />
        )}
      </div>
    </div>
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
    <div className="mt-2 text-center">
      <span className="text-destructive mt-2">{error}</span>
    </div>
  ) : null

  if (validatingAllowance) {
    return (
      <div className="flex items-center justify-center">
        <Skeleton className="h-4 w-4 rounded-full" />
        <span className="ml-3 font-semibold">
          <Trans>Verifying allowance...</Trans>
        </span>
      </div>
    )
  }

  if (!hasAllowance && !isLoading && !isApproved) {
    return (
      <div className="mt-4">
        <GasEstimate gasLimit={APPROVE_GAS_ESTIMATE} />
        <Button fullWidth onClick={execute} disabled={!isReady}>
          {!isReady ? 'Preparing approval' : 'Approve use of RSR'}
        </Button>
        {errorMsg}
      </div>
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
      <div className="mt-4">
        {allowance && (isApproved || !hasAllowance) && (
          <ApprovalStatus
            allowance={allowance}
            hash={approvalHash}
            success={isApproved}
          />
        )}
        <div className="flex items-center">
          <TransactionsIcon />
          <div className="ml-2 mr-auto">
            <span className="font-semibold block">
              {!executeHash ? 'Confirm Stake' : 'Transaction submitted'}
            </span>
            {executeHash ? (
              <a
                target="_blank"
                href={getExplorerLink(
                  executeHash,
                  chain,
                  ExplorerDataType.TRANSACTION
                )}
                className="text-primary hover:underline"
              >
                <Trans>View in explorer</Trans>
              </a>
            ) : (
              <span>{statusText}</span>
            )}
          </div>
          {!!statusText && !isConfirmed && (
            <Skeleton className="h-4 w-4 rounded-full animate-spin" />
          )}
          {isConfirmed && <CheckCircleIcon />}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4">
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
    </div>
  )
}
export default ConfirmStakeButton
