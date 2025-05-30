import { atom, useAtom, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
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

export const proposalRefreshFnAtom = atom<(() => void) | null>(null)

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
    if (proposal) {
      // Refresh proposal voting state every minute
      if (!FINALIZED_PROPOSAL_STATES.includes(proposal.state)) {
        const interval = setInterval(() => {
          const votingState = getProposalState(proposal)
          setProposalDetail({
            ...proposal,
            votingState,
            state: votingState.state,
          })
        }, 1000 * 60)

        return () => clearInterval(interval)
      }
    }
  }, [proposal?.state])

  return null
}

const Updater = () => {
  const [key, setKey] = useState(0)
  const setRefreshFn = useSetAtom(proposalRefreshFnAtom)

  const refreshProposal = () => {
    setKey((k) => k + 1)
  }

  useEffect(() => {
    setRefreshFn(() => refreshProposal)
  }, [])

  return (
    <div key={key}>
      <ProposalUpdater />
    </div>
  )
}

export default Updater
