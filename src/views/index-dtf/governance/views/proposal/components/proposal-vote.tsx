import DelegateIcon from '@/components/icons/DelegateIcon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import { PROPOSAL_STATES } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, AsteriskIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import DelegateModal from '../../../components/delegate-modal'
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

const FINAL_STATES = [
  PROPOSAL_STATES.EXECUTED,
  PROPOSAL_STATES.DEFEATED,
  PROPOSAL_STATES.EXPIRED,
  PROPOSAL_STATES.CANCELED,
  PROPOSAL_STATES.QUORUM_NOT_REACHED,
  PROPOSAL_STATES.SUCCEEDED,
  PROPOSAL_STATES.QUEUED
]

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
        <span>View execute tx</span>
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
  const [isDelegateVisible, setDelegateVisible] = useState(false)
  const { votePower = '0.0' } = useAtomValue(accountVotesAtom)
  const { hasUndelegatedBalance, hasNoDelegates } = useDelegateState()

  if (state !== PROPOSAL_STATES.PENDING && state !== PROPOSAL_STATES.ACTIVE) return null

  return (
    <>
      <div className="flex items-center justify-between gap-2 p-3 flex-wrap text-sm border-b xl:min-w-80">
        <div className="flex items-center gap-1">
          <AsteriskIcon size={16} />
          <span>Your voting power:</span>
          <span className="font-bold">
            {formatCurrency(votePower ? +votePower : 0)}
          </span>
        </div>
        {state === PROPOSAL_STATES.PENDING && (
          <div
            className={cn(
              'flex items-center gap-1 cursor-pointer',
              hasUndelegatedBalance ? 'text-[#2150A9]' : 'text-[#D9D9D9]',
              !hasUndelegatedBalance && 'cursor-default'
            )}
            onClick={() => hasUndelegatedBalance && setDelegateVisible(true)}
          >
            <DelegateIcon />
            <span className="font-semibold hidden xl:block">Delegate</span>
          </div>
        )}

      </div>
      {isDelegateVisible && (
        <DelegateModal
          delegated={!hasNoDelegates}
          onClose={() => setDelegateVisible(false)}
        />
      )}
    </>
  )
}

const ProposalSummary = () => (
  <div
    className="flex flex-col h-full rounded-xl bg-[#f2f2f2] dark:bg-input"
  >
    <ProposalVoteOverview />
    <div className="flex-grow p-3">
      <ProposalDeadlineAlert />
    </div>
  </div>
)

const ProposalVote = () => (
  <>
    <div className="flex flex-col gap-2 m-1 lg:m-2 p-2 border border-secondary rounded-2xl ">
      <ProposalSummary />
      <ProposalActionButtons />
    </div>
  </>
)

export default ProposalVote
