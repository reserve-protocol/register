import { PROPOSAL_STATES } from '@/utils/constants'

export type ProposalSort = 'status' | 'newest'

// Ranked by what a voter can act on now: vote, then upcoming vote, then
// queue/execute, then finished outcomes.
const STATUS_PRIORITY: string[] = [
  PROPOSAL_STATES.ACTIVE,
  PROPOSAL_STATES.PENDING,
  PROPOSAL_STATES.SUCCEEDED,
  PROPOSAL_STATES.QUEUED,
  PROPOSAL_STATES.EXECUTED,
  PROPOSAL_STATES.DEFEATED,
  PROPOSAL_STATES.QUORUM_NOT_REACHED,
  PROPOSAL_STATES.CANCELED,
  PROPOSAL_STATES.EXPIRED,
]

const statusRank = (state: string) => {
  const rank = STATUS_PRIORITY.indexOf(state)
  return rank === -1 ? STATUS_PRIORITY.length : rank
}

export const sortProposals = <T extends { creationTime: string }>(
  proposals: T[],
  sort: ProposalSort,
  getState: (proposal: T) => string
): T[] =>
  [...proposals].sort((a, b) => {
    if (sort === 'status') {
      const byStatus = statusRank(getState(a)) - statusRank(getState(b))
      if (byStatus !== 0) return byStatus
    }
    return Number(b.creationTime) - Number(a.creationTime)
  })
