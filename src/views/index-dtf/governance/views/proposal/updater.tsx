import { atom, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { accountVotesAtom, proposalDetailAtom } from './atom'
import useProposalDetail from './hooks/use-proposal-detail'
import useVoterState from './hooks/use-voter-state'

export const proposalRefreshFnAtom = atom<(() => void) | null>(null)

const ProposalUpdater = () => {
  const { proposalId } = useParams()
  const { data: proposalDetail } = useProposalDetail(proposalId)
  const accountVotes = useVoterState()
  const setProposalDetail = useSetAtom(proposalDetailAtom)
  const setAccountVotes = useSetAtom(accountVotesAtom)

  useEffect(() => {
    setProposalDetail(proposalDetail)
  }, [proposalDetail, setProposalDetail])

  useEffect(() => {
    setAccountVotes(accountVotes ?? { vote: null, votePower: null })
  }, [accountVotes, setAccountVotes])

  useEffect(() => {
    return () => {
      setProposalDetail(undefined)
      setAccountVotes({ vote: null, votePower: null })
    }
  }, [setAccountVotes, setProposalDetail])

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
