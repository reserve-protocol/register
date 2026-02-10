import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Spinner from '@/components/ui/spinner'
import { Trans, t } from '@lingui/macro'
import CheckCircleIcon from 'components/icons/CheckCircleIcon'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import ApprovalStatus from 'components/transaction-modal/ApprovalStatus'
import useApproveAndExecute from 'hooks/useApproveAndExecute'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { stakeAllowanceAtom, stakeTransactionAtom } from './atoms'

const APPROVE_GAS_ESTIMATE = 400000


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
      <div>
        <Button className="w-full" onClick={execute} disabled={!isReady}>
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
            <Spinner />
          )}
          {isConfirmed && <CheckCircleIcon />}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Button disabled={!isReady} onClick={execute} className="w-full">
        {!isReady ? 'Preparing transaction' : 'Confirm Stake'}
      </Button>
      {errorMsg}
    </div>
  )
}
export default ConfirmStakeButton
