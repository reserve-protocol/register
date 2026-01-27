import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import CheckCircleIcon from 'components/icons/CheckCircleIcon'
import GasIcon from 'components/icons/GasIcon'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { unstakeDelayAtom } from '@/views/yield-dtf/staking/atoms'
import { unstakeGasEstimateAtom, unstakeTransactionAtom } from './atoms'
import { UseSimulateContractParameters } from 'wagmi'
import { Skeleton } from '@/components/ui/skeleton'

const GasEstimate = () => {
  const estimate = useAtomValue(unstakeGasEstimateAtom)

  return (
    <div className="flex items-center mb-2">
      <span>Estimated gas cost:</span>
      <div className="ml-auto flex items-center">
        <GasIcon />
        {estimate ? (
          <span className="font-semibold ml-1">
            ${formatCurrency(estimate, 3)}
          </span>
        ) : (
          <Skeleton className="h-4 w-12 ml-1" />
        )}
      </div>
    </div>
  )
}

const ConfirmUnstakeButton = () => {
  const chain = useAtomValue(chainIdAtom)
  const tx: UseSimulateContractParameters | undefined = useAtomValue(
    unstakeTransactionAtom
  )
  const delay = useAtomValue(unstakeDelayAtom)
  const { write, isReady, isLoading, hash, error, validationError } =
    useContractWrite(tx)

  const { status } = useWatchTransaction({
    hash,
    label: 'Unstake',
  })

  const errorMsg = useMemo(() => {
    let errorText = null

    if (validationError) {
      errorText =
        (validationError.cause as any)?.shortMessage ||
        validationError.message ||
        'Simulation failed'
    }

    if (error?.message.includes('User rejected the request')) {
      errorText = 'Transaction rejected'
    }

    if (error || status === 'error') {
      errorText = 'Execution failed'
    }

    return errorText
  }, [error, status, validationError])

  if (!errorMsg && (isLoading || hash)) {
    return (
      <div className="flex items-center">
        <TransactionsIcon />
        <div className="ml-2 mr-auto">
          <span className="font-semibold block">
            {status === 'success' && `${delay} cooldown started`}
            {hash && status !== 'success' && 'Transaction submitted'}
            {!hash && 'Confirm Unstake'}
          </span>
          {hash ? (
            <a
              target="_blank"
              href={getExplorerLink(hash, chain, ExplorerDataType.TRANSACTION)}
              className="text-primary hover:underline"
            >
              <Trans>View in explorer</Trans>
            </a>
          ) : (
            <span>Proceed in wallet</span>
          )}
        </div>
        {status !== 'success' ? (
          <Skeleton className="h-4 w-4 rounded-full animate-spin" />
        ) : (
          <CheckCircleIcon />
        )}
      </div>
    )
  }

  return (
    <div className="mt-4">
      <GasEstimate />
      <Button disabled={!isReady} onClick={write} className="w-full">
        {!isReady ? 'Preparing transaction' : 'Begin unstaking process'}
      </Button>
      {!!errorMsg && (
        <div className="mt-2 text-center">
          <span className="text-destructive mt-2">{errorMsg}</span>
        </div>
      )}
    </div>
  )
}

export default ConfirmUnstakeButton
