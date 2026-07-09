import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PROPOSAL_STATES } from '@/utils/constants'
import type { ProposalDetail } from '@/lib/governance'
import { accountVotesAtom, proposalDetailAtom } from './atom'
import useProposalDetail from './hooks/use-proposal-detail'
import useVoterState from './hooks/use-voter-state'

const ProposalUpdater = () => {
  const { proposalId } = useParams()
  const { data: proposalDetail } = useProposalDetail(proposalId)
  const accountVotes = useVoterState()
  const setProposalDetail = useSetAtom(proposalDetailAtom)
  const setAccountVotes = useSetAtom(accountVotesAtom)

  useEffect(() => {
    setProposalDetail((current) =>
      shouldKeepLocalProposalState(current, proposalDetail)
        ? current
        : proposalDetail
    )
  }, [proposalDetail, setProposalDetail])

  useEffect(() => {
    setAccountVotes(
      accountVotes ?? {
        vote: null,
        votePower: null,
        hasProposalVotingPower: null,
      }
    )
  }, [accountVotes, setAccountVotes])

  useEffect(() => {
    return () => {
      setProposalDetail(undefined)
      setAccountVotes({
        vote: null,
        votePower: null,
        hasProposalVotingPower: null,
      })
    }
  }, [setAccountVotes, setProposalDetail])

  return null
}

function shouldKeepLocalProposalState(
  current: ProposalDetail | undefined,
  next: ProposalDetail | undefined
) {
  if (!current || !next || current.id !== next.id) return false

  const currentState = current.votingState.state
  const nextState = next.votingState.state

  if (currentState === PROPOSAL_STATES.EXECUTED) {
    return nextState !== PROPOSAL_STATES.EXECUTED
  }

  if (currentState === PROPOSAL_STATES.CANCELED) {
    return nextState !== PROPOSAL_STATES.CANCELED
  }

  if (currentState === PROPOSAL_STATES.QUEUED) {
    return [
      PROPOSAL_STATES.PENDING,
      PROPOSAL_STATES.ACTIVE,
      PROPOSAL_STATES.SUCCEEDED,
    ].includes(nextState)
  }

  return false
}

export default ProposalUpdater
