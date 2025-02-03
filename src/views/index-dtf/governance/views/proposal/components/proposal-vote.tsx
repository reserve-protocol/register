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
]

const STATES_WITH_ACTIONS = [
  PROPOSAL_STATES.SUCCEEDED,
  PROPOSAL_STATES.EXECUTED,
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
        variant="outline-primary"
        className="flex items-center gap-2 justify-center w-full"
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

  if (FINAL_STATES.includes(state)) return null

  return (
    <>
      <div className="flex items-center justify-between gap-2 p-3 flex-wrap text-sm border-b">
        <div className="flex items-center gap-1">
          <AsteriskIcon />
          <span>Your voting power:</span>
          <span className="font-bold">
            {formatCurrency(votePower ? +votePower : 0)}
          </span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 cursor-pointer',
            hasUndelegatedBalance ? 'text-[#2150A9]' : 'text-[#D9D9D9]',
            !hasUndelegatedBalance && 'cursor-default'
          )}
          onClick={() => hasUndelegatedBalance && setDelegateVisible(true)}
        >
          <DelegateIcon />
          <span className="font-bold">Delegate</span>
        </div>
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

const ProposalSummary = () => {
  const state = useAtomValue(proposalStateAtom) ?? ''

  return (
    <div
      className={cn(
        'flex flex-col h-full rounded-lg ',
        STATES_WITH_ACTIONS.includes(state) && 'border',
        !FINAL_STATES.includes(state) && 'bg-[#f2f2f2]'
      )}
    >
      <ProposalVoteOverview />
      <div className="flex-grow p-3">
        <ProposalDeadlineAlert />
      </div>
    </div>
  )
}

const ProposalVote = () => (
  <>
    <div className="py-1 md:py-2 flex flex-col gap-2 m-2 border rounded-3xl p-2">
      <div className="flex flex-col text-center justify-between p-2 flex-grow gap-2 border rounded-3xl">
        <ProposalSummary />
      </div>
      <ProposalActionButtons />
    </div>
  </>
)

export default ProposalVote
