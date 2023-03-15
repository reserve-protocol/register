import { useAtomValue } from 'jotai'
import { Box } from 'theme-ui'
import { PROPOSAL_STATES } from 'utils/constants'
import { getProposalStateAtom } from '../atom'
import ProposalExecute from './ProposalExecute'
import ProposalQueue from './ProposalQueue'
import ProposalVote from './ProposalVote'

const ProposalAction = () => {
  const { state } = useAtomValue(getProposalStateAtom)

  if (state === PROPOSAL_STATES.PENDING || state === PROPOSAL_STATES.ACTIVE) {
    return <ProposalVote />
  }

  if (state === PROPOSAL_STATES.SUCCEEDED) {
    return <ProposalQueue />
  }

  if (state === PROPOSAL_STATES.QUEUED) {
    return <ProposalExecute />
  }

  return null
}

export default ProposalAction
