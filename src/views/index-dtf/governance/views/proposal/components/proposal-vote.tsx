import DelegateIcon from '@/components/icons/DelegateIcon'
import { Button } from '@/components/ui/button'
import { CurrentDtfVoteLock } from '@/components/vote-lock'
import { chainIdAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import { PROPOSAL_STATES } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, AsteriskIcon, HandFist, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  accountVotesAtom,
  proposalDetailAtom,
  proposalStateAtom,
} from '../atom'
import useDelegateState from '../hooks/use-delegate-state'
import ProposalCancel from './proposal-cancel-button'
import ProposalDeadlineAlert from './proposal-deadline-alert'
import ProposalExecute from './proposal-execute-button'
import ProposalQueue from './proposal-queue-button'
import ProposalVoteButton from './proposal-vote-button'

const ViewExecuteTxButton = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (!proposal?.executionTxnHash) return null

  return (
    <Link
      to={getExplorerLink(
        proposal.executionTxnHash,
        chainId,
        ExplorerDataType.TRANSACTION
      )}
      target="_blank"
    >
      <Button
        variant="outline"
        className="flex items-center gap-2  justify-center w-full"
      >
        <span>
          <Trans>View execute tx</Trans>
        </span>
        <ArrowUpRight size={16} strokeWidth={1.5} />
      </Button>
    </Link>
  )
}

const ProposalActionButtons = () => {
  const state = useAtomValue(proposalStateAtom)

  if (state === PROPOSAL_STATES.QUEUED) {
    return (
      <div className="flex flex-col gap-1">
        <ProposalCancel />
        <ProposalExecute />
      </div>
    )
  }

  if (state === PROPOSAL_STATES.SUCCEEDED) {
    return <ProposalQueue />
  }

  if (state === PROPOSAL_STATES.EXECUTED) {
    return <ViewExecuteTxButton />
  }

  if (state === PROPOSAL_STATES.PENDING || state === PROPOSAL_STATES.ACTIVE) {
    return <ProposalVoteButton />
  }

  return null
}

const ProposalVoteOverview = () => {
  const state = useAtomValue(proposalStateAtom) ?? ''
  const { votePower = '0.0' } = useAtomValue(accountVotesAtom)
  const { hasUndelegatedBalance } = useDelegateState()

  if (state !== PROPOSAL_STATES.PENDING && state !== PROPOSAL_STATES.ACTIVE) {
    return null
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 p-3 flex-wrap text-sm border-b xl:min-w-80">
        <div className="flex items-center gap-1">
          <AsteriskIcon size={16} />
          <span>
            <Trans>Your voting power:</Trans>
          </span>
          <span className="font-bold">
            {formatCurrency(votePower ? +votePower : 0)}
          </span>
        </div>
        {state === PROPOSAL_STATES.PENDING && hasUndelegatedBalance && (
          <CurrentDtfVoteLock initialTab="delegate">
            <button
              type="button"
              className="flex items-center gap-1 text-[#2150A9]"
            >
              <DelegateIcon />
              <span className="font-semibold hidden xl:block">
                <Trans>Delegate</Trans>
              </span>
            </button>
          </CurrentDtfVoteLock>
        )}
        {state === PROPOSAL_STATES.PENDING && !hasUndelegatedBalance && (
          <div className="flex items-center gap-1 text-[#D9D9D9]">
            <DelegateIcon />
            <span className="font-semibold hidden xl:block">
              <Trans>Delegate</Trans>
            </span>
          </div>
        )}
      </div>
    </>
  )
}

const ProposalSummary = () => (
  <div className="flex flex-col h-full rounded-xl bg-[#f2f2f2] dark:bg-input">
    <ProposalVoteOverview />
    <div className="flex-grow min-h-36 p-3">
      <ProposalDeadlineAlert />
    </div>
  </div>
)

const ChallengedProposalHelp = () => {
  const proposal = useAtomValue(proposalDetailAtom)

  if (!proposal || !proposal.wasChallenged) return null

  return (
    <div className="flex items-center rounded-xl bg-warning/10 p-2 gap-2">
      <div className="flex items-center justify-center p-2 text-warning bg-warning/10 rounded-full">
        <HandFist size={16} />
      </div>
      <span className="text-xs">
        <h4 className="font-semibold text-warning">
          <Trans>Contested</Trans>
        </h4>
        <Trans>
          This was originally a fast proposal that did not pass governance. Please review the details of this contested proposal closely.
        </Trans>
      </span>
    </div>
  )
}

const FastProposalHelp = () => {
  const proposal = useAtomValue(proposalDetailAtom)

  if (!proposal || !proposal.isOptimistic) return null

  return (
    <div className="flex items-center rounded-xl bg-primary/10 p-2 gap-2">
      <div className="flex items-center justify-center p-2 text-primary bg-primary/10 rounded-full">
        <Rocket size={16} />
      </div>
      <span className="text-xs">
        <h4 className="font-semibold text-primary">
          <Trans>Fast proposal</Trans>
        </h4>
        <Trans>
          This proposal will automatically pass if it is not challenged by governance. If it is challenged, it will be resubmitted as a standard proposal.
        </Trans>
      </span>
    </div>
  )
}

const ProposalVote = () => (
  <>
    <div className="flex flex-col gap-2 m-1 lg:m-2 p-2 border border-secondary rounded-2xl ">
      <ProposalSummary />
      <FastProposalHelp />
      <ChallengedProposalHelp />
      <ProposalActionButtons />
    </div>
  </>
)

export default ProposalVote
