import { Trans, t } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import CopyValue from '@/components/ui/copy-value'
import GoTo from '@/components/ui/go-to'
import TransactionButton from '@/components/ui/transaction-button'
import Spinner from '@/components/ui/spinner'
import ConfirmProposalActionIcon from 'components/icons/ConfirmProposalActionIcon'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chainIdAtom } from 'state/atoms'
import { getTokenRoute, shortenString } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { isProposalEditingAtom } from '../atoms'
import useRToken from 'hooks/useRToken'
import { ROUTES } from 'utils/constants'
import { UseSimulateContractParameters } from 'wagmi'
import { cn } from '@/lib/utils'

interface Props {
  tx: UseSimulateContractParameters
  className?: string
}

const ProposalStatus = ({
  transactionState,
}: {
  transactionState: UseSimulateContractParameters | undefined
}) => {
  const navigate = useNavigate()
  const { gas, write, isReady, isLoading, hash } =
    useContractWrite(transactionState)
  const { status } = useWatchTransaction({
    hash,
    label: 'Create proposal',
  })
  const token = useRToken()
  const chainId = useAtomValue(chainIdAtom)

  useEffect(() => {
    if (status === 'success') {
      navigate(
        token
          ? getTokenRoute(token.address, token.chainId, ROUTES.GOVERNANCE)
          : '../'
      )
    }
  }, [status])

  if (isLoading) {
    return (
      <>
        <Spinner size={24} className="mt-4 mb-2" />
        <span className="font-medium block">
          <Trans>Pending, sign in wallet</Trans>
        </span>
        <p className="text-legend">
          <Trans>
            Please sign the transaction in your wallet to continue with the
            governance process.
          </Trans>
        </p>
      </>
    )
  }

  if (hash) {
    return (
      <>
        <Spinner size={24} className="mt-4 mb-2" />
        <span className="font-medium text-lg block mb-2">
          <Trans>Transaction submitted</Trans>
        </span>
        <p className="text-legend">
          <Trans>
            Stay patient while the transaction is in progress & don't close this
            window to avoid issues finding your way back here.
          </Trans>
        </p>
        <div className="flex items-center justify-center mt-6">
          <span className="text-legend">{shortenString(hash)}</span>
          <CopyValue className="ml-4 mr-2" value={hash} />
          <GoTo
            href={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
          />
        </div>
      </>
    )
  }

  return (
    <TransactionButton
      text={t`Submit proposal on-chain`}
      className="mt-6 w-full"
      disabled={!isReady}
      onClick={write}
      gas={gas}
    />
  )
}

const ConfirmProposalOverview = ({ tx, className }: Props) => {
  const setProposalEditing = useSetAtom(isProposalEditingAtom)

  return (
    <div className={className}>
      <div className="max-h-[calc(100vh-124px)] flex flex-col overflow-hidden">
        <div className="flex items-center flex-col text-center border border-border rounded-3xl p-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setProposalEditing(true)}
            className="mr-auto"
          >
            <Trans>Edit</Trans>
          </Button>
          <ConfirmProposalActionIcon />
          <span className="text-xl font-medium mb-2">
            <Trans>Confirm & Submit</Trans>
          </span>
          <p className="text-legend">
            Submit the proposal to be voted on by [stRSR] holders. Note this is
            an on-chain action and will require gas to propose.
          </p>
          <ProposalStatus transactionState={tx} />
        </div>
      </div>
    </div>
  )
}

export default ConfirmProposalOverview
