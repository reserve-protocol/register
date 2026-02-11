import { Trans, t } from '@lingui/macro'
import CopyValue from '@/components/ui/copy-value'
import GoTo from '@/components/ui/go-to'
import TransactionButton from '@/components/ui/transaction-button'
import Spinner from '@/components/ui/spinner'
import GovernanceActionIcon from 'components/icons/GovernanceActionIcon'
import useRToken from 'hooks/useRToken'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chainIdAtom } from 'state/atoms'
import { Separator } from '@/components/ui/separator'
import { getTokenRoute, shortenString } from 'utils'
import { ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Hex } from 'viem'
import useGovernance from '../useGovernance'
import TransactionError from 'components/transaction-error/TransactionError'

const Pending = () => (
  <>
    <Spinner className="mt-3 mb-2" size={24} />
    <span className="font-medium block">
      <Trans>Pending, sign in wallet</Trans>
    </span>
    <p className="text-legend">
      <Trans>
        Please sign the transaction in your wallet to continue with the
        government configuration process.
      </Trans>
    </p>
  </>
)

const Mining = ({ hash }: { hash: Hex }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <>
      <Spinner size={24} className="mt-3 mb-2" />
      <span className="font-medium text-lg block mb-2">
        <Trans>Transaction submitted</Trans>
      </span>
      <p className="text-legend">
        <Trans>
          Stay patient while the transaction is in progress & don't close this
          window to avoid issues finding your way back here.
        </Trans>
      </p>
      <div className="flex items-center justify-center mt-4">
        <span className="text-legend">{shortenString(hash)}</span>
        <CopyValue ml={3} mr={2} value={hash} />
        <GoTo
          href={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
        />
      </div>
    </>
  )
}

const GovernanceStatus = () => {
  const navigate = useNavigate()
  const rToken = useRToken()
  const chainId = useAtomValue(chainIdAtom)
  const { write, isReady, isLoading, gas, hash, validationError, error } =
    useGovernance()
  const { status } = useWatchTransaction({
    hash,
    label: 'Setup Governance',
  })

  useEffect(() => {
    if (status === 'success' && rToken?.address) {
      // TODO: Get addresses from logs and manually update governance and dont wait for theGraph to catch up
      navigate(getTokenRoute(rToken.address, chainId, ROUTES.SETTINGS))
    }
  }, [status])

  if (isLoading && !hash) {
    return <Pending />
  }

  if (hash) {
    return <Mining hash={hash} />
  }

  return (
    <>
      <p className="text-legend text-center">
        <Trans>
          RToken will be ready to use after this TX if you choose to unpause.
        </Trans>
      </p>

      <TransactionButton
        text={t`Deploy Governance`}
        className="mt-6 w-full"
        disabled={!isReady}
        onClick={write}
        gas={gas}
      />

      <TransactionError className="mt-4" error={validationError || error} />
    </>
  )
}

interface GovernanceOverviewProps {
  className?: string
}

const GovernanceOverview = ({ className }: GovernanceOverviewProps) => (
  <div
    className={`h-fit border border-border rounded-3xl p-4 ${className || ''}`}
  >
    <div className="flex flex-col items-center text-center py-2">
      <GovernanceActionIcon />
      <span className="text-xl font-medium mt-2 mb-1">
        <Trans>Tx2. Governance</Trans>
      </span>
      <GovernanceStatus />
    </div>
    <Separator className="my-4 -mx-4" />
    <div>
      <span className="font-semibold block mb-2">
        <Trans>Not ready to set up governance?</Trans>
      </span>
      <p className="text-legend">
        <Trans>
          You can leave your RToken paused and come back to setting up
          governance later.
        </Trans>
      </p>
    </div>
  </div>
)

export default GovernanceOverview
