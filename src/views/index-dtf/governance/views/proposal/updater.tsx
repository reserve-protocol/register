import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { accountVotesAtom, proposalDetailAtom } from './atom'
import useProposalDetail from './hooks/use-proposal-detail'
import useVoterState from './hooks/use-voter-state'

const Updater = () => {
  const { proposalId } = useParams()
  const { data: proposalDetail } = useProposalDetail(proposalId)
  const accountVotes = useVoterState()
  const setProposalDetail = useSetAtom(proposalDetailAtom)
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

  return null
}

export default Updater
