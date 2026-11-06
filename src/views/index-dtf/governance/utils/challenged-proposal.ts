import { PROPOSAL_STATES } from '@/utils/constants'

export const getConfirmationProposalId = (
  proposalId: string,
  proposals:
    | readonly { id: string; challengedProposalId?: string }[]
    | undefined
) =>
  proposals?.find((proposal) => proposal.challengedProposalId === proposalId)
    ?.id

// A veto or a cancel ends the vote before voteEnd.
export const isVotingClosedEarly = (
  { state, voteEnd }: { state: string; voteEnd: number },
  now: number
) =>
  state !== PROPOSAL_STATES.PENDING &&
  state !== PROPOSAL_STATES.ACTIVE &&
  now < voteEnd
