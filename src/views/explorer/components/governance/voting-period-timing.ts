import { PROPOSAL_STATES } from 'utils/constants'

type VotingBoundary = number | 'passed' | null

interface VotingPeriodInput {
  status: string
  votingStartsIn: number | null
  votingEndsIn: number | null
}

interface VotingPeriodTiming {
  starts: VotingBoundary
  ends: VotingBoundary
}

export const getVotingPeriodTiming = ({
  status,
  votingStartsIn,
  votingEndsIn,
}: VotingPeriodInput): VotingPeriodTiming => {
  if (status === PROPOSAL_STATES.PENDING) {
    return {
      starts: getCountdown(votingStartsIn),
      ends: null,
    }
  }

  if (status === PROPOSAL_STATES.ACTIVE) {
    return {
      starts: 'passed',
      ends: getCountdown(votingEndsIn),
    }
  }

  return {
    starts: getPassedBoundary(votingStartsIn),
    ends: getPassedBoundary(votingEndsIn),
  }
}

const getCountdown = (seconds: number | null): VotingBoundary => {
  if (seconds === null || !Number.isFinite(seconds)) return null
  return seconds > 0 ? seconds : 'passed'
}

const getPassedBoundary = (seconds: number | null): VotingBoundary => {
  if (seconds === null || !Number.isFinite(seconds) || seconds > 0) return null
  return 'passed'
}
