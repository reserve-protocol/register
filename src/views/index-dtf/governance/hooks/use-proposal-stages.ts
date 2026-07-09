import type { ProposalStage } from '@/components/proposal-status-bar'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { PROPOSAL_STATES } from '@/utils/constants'
import type { IndexDtfProposalSummary } from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

const progressFromDeadline = (deadline: number | null, duration: number) => {
  if (deadline === null || duration <= 0) return 0
  return Math.min(1, Math.max(0, 1 - deadline / duration))
}

export const useProposalStages = (
  proposal: IndexDtfProposalSummary
): ProposalStage[] => {
  const dtf = useAtomValue(indexDTFAtom)

  const target = proposal.governance.toLowerCase()
  const governance = [
    dtf?.ownerGovernance,
    dtf?.tradingGovernance,
    dtf?.stToken?.governance,
  ].find((g) => g?.address.toLowerCase() === target)
  const executionDelay = governance?.timelock.executionDelay ?? 0

  const { state, creationTime, voteStart, voteEnd, isOptimistic, votingState } =
    proposal
  const { deadline } = votingState

  return useMemo(() => {
    const votingDelay = voteStart - creationTime
    const votingDuration = voteEnd - voteStart
    const stages: ProposalStage[] = []

    if (!isOptimistic && votingDelay > 0) {
      stages.push({
        key: 'voting-delay',
        duration: votingDelay,
        status: state === PROPOSAL_STATES.PENDING ? 'in-progress' : 'completed',
        progress:
          state === PROPOSAL_STATES.PENDING
            ? progressFromDeadline(deadline, votingDelay)
            : undefined,
      })
    }

    stages.push({
      key: 'voting',
      duration: votingDuration,
      status:
        state === PROPOSAL_STATES.PENDING
          ? 'pending'
          : state === PROPOSAL_STATES.ACTIVE
            ? 'in-progress'
            : 'completed',
      progress:
        state === PROPOSAL_STATES.ACTIVE
          ? progressFromDeadline(deadline, votingDuration)
          : undefined,
    })

    if (!isOptimistic) {
      stages.push({
        key: 'execution-delay',
        duration: executionDelay,
        status:
          state === PROPOSAL_STATES.EXECUTED
            ? 'completed'
            : state === PROPOSAL_STATES.QUEUED
              ? 'in-progress'
              : 'pending',
        progress:
          state === PROPOSAL_STATES.QUEUED
            ? progressFromDeadline(deadline, executionDelay)
            : undefined,
      })
    }

    return stages
  }, [
    state,
    creationTime,
    voteStart,
    voteEnd,
    isOptimistic,
    deadline,
    executionDelay,
  ])
}

export default useProposalStages
