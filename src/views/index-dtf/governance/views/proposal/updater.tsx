import { useAtom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { accountVotesAtom, proposalDetailAtom } from './atom'
import useProposalDetail from './hooks/use-proposal-detail'
import useVoterState from './hooks/use-voter-state'
import { PROPOSAL_STATES } from '@/utils/constants'
import { getProposalState } from '@/lib/governance'

const FINALIZED_PROPOSAL_STATES = [
  PROPOSAL_STATES.EXECUTED,
  PROPOSAL_STATES.CANCELED,
  PROPOSAL_STATES.EXPIRED,
  PROPOSAL_STATES.DEFEATED,
  PROPOSAL_STATES.QUORUM_NOT_REACHED,
]

const ProposalUpdater = () => {
  const { proposalId } = useParams()
  const { data: proposalDetail, error } = useProposalDetail(proposalId)
  const accountVotes = useVoterState()
  const [proposal, setProposalDetail] = useAtom(proposalDetailAtom)
  const setAccountVotes = useSetAtom(accountVotesAtom)

  useEffect(() => {
    if (proposalDetail) {
      setProposalDetail(proposalDetail)
    }
  }, [proposalDetail])

  useEffect(() => {
    if (accountVotes) {
      setAccountVotes(accountVotes)
    }
  }, [accountVotes])

  useEffect(() => {
    return () => {
      setProposalDetail(undefined)
      setAccountVotes({ vote: null, votePower: null })
    }
  }, [])

  useEffect(() => {
    if (!proposal) return
    if (FINALIZED_PROPOSAL_STATES.includes(proposal.state)) return

    const deadline = proposal.votingState.deadline
    if (deadline === null) return

    // Tick faster near deadline: every 1s in last 5 min, every 10s otherwise
    const intervalMs = deadline <= 300 ? 1000 : 10_000

    const recalculate = () => {
      // WHY: updater form to avoid overwriting optimistic updates from actions
      setProposalDetail((prev) => {
        if (!prev) return prev
        const votingState = getProposalState(prev)
        if (
          votingState.state !== prev.votingState.state ||
          votingState.deadline !== prev.votingState.deadline
        ) {
          return { ...prev, votingState, state: votingState.state }
        }
        return prev
      })
    }

    const interval = setInterval(recalculate, intervalMs)

    // Schedule exact state transition at deadline
    if (deadline > 0) {
      const timeout = setTimeout(recalculate, deadline * 1000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }

    return () => clearInterval(interval)
  }, [proposal?.state, proposal?.votingState.deadline])

  return null
}

export default ProposalUpdater
