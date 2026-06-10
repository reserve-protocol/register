import { PROPOSAL_STATES } from '@/utils/constants'

export type ProposalFlowInput = {
  isOptimistic?: boolean | null
  executionETA?: number | null
  state?: string | null
  votingState?: {
    state?: string | null
  } | null
}

export const getProposalFlowState = (proposal?: ProposalFlowInput) =>
  proposal?.votingState?.state ?? proposal?.state

export const isOptimisticReadyToExecute = (
  proposal?: ProposalFlowInput
) =>
  !!proposal?.isOptimistic &&
  getProposalFlowState(proposal) === PROPOSAL_STATES.SUCCEEDED

export const shouldQueueProposal = (proposal?: ProposalFlowInput) =>
  !proposal?.isOptimistic &&
  getProposalFlowState(proposal) === PROPOSAL_STATES.SUCCEEDED

export const isQueuedReadyToExecute = (
  proposal: ProposalFlowInput | undefined,
  now: number
) => {
  const executionETA = proposal?.executionETA

  return (
    getProposalFlowState(proposal) === PROPOSAL_STATES.QUEUED &&
    typeof executionETA === 'number' &&
    executionETA <= now
  )
}

export const canExecuteProposal = (
  proposal: ProposalFlowInput | undefined,
  now: number
) => isOptimisticReadyToExecute(proposal) || isQueuedReadyToExecute(proposal, now)

export const shouldShowQueueStep = (proposal?: ProposalFlowInput) => {
  if (proposal?.isOptimistic) return false

  return [
    PROPOSAL_STATES.QUEUED,
    PROPOSAL_STATES.EXECUTED,
    PROPOSAL_STATES.CANCELED,
  ].includes(getProposalFlowState(proposal) ?? '')
}

export const shouldShowEndStep = (proposal?: ProposalFlowInput) =>
  isOptimisticReadyToExecute(proposal) ||
  [
    PROPOSAL_STATES.QUEUED,
    PROPOSAL_STATES.EXECUTED,
    PROPOSAL_STATES.CANCELED,
  ].includes(getProposalFlowState(proposal) ?? '')
