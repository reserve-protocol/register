import { PROPOSAL_STATES } from '@/utils/constants'
import { describe, expect, it } from 'vitest'
import {
  canExecuteProposal,
  isOptimisticReadyToExecute,
  isQueuedReadyToExecute,
  shouldQueueProposal,
  shouldShowEndStep,
  shouldShowQueueStep,
  type ProposalFlowInput,
} from '../proposal-flow'

const proposal = (
  state: string,
  props: Partial<ProposalFlowInput> = {}
): ProposalFlowInput => ({
  votingState: { state },
  ...props,
})

describe('proposal-flow', () => {
  it('executes optimistic succeeded proposals without queueing', () => {
    const item = proposal(PROPOSAL_STATES.SUCCEEDED, { isOptimistic: true })

    expect(isOptimisticReadyToExecute(item)).toBe(true)
    expect(canExecuteProposal(item, 100)).toBe(true)
    expect(shouldQueueProposal(item)).toBe(false)
    expect(shouldShowQueueStep(item)).toBe(false)
    expect(shouldShowEndStep(item)).toBe(true)
  })

  it('queues standard succeeded proposals', () => {
    const item = proposal(PROPOSAL_STATES.SUCCEEDED, { isOptimistic: false })

    expect(shouldQueueProposal(item)).toBe(true)
    expect(canExecuteProposal(item, 100)).toBe(false)
    expect(shouldShowEndStep(item)).toBe(false)
  })

  it('does not execute queued proposals before eta', () => {
    const item = proposal(PROPOSAL_STATES.QUEUED, { executionETA: 200 })

    expect(isQueuedReadyToExecute(item, 100)).toBe(false)
    expect(canExecuteProposal(item, 100)).toBe(false)
    expect(shouldShowQueueStep(item)).toBe(true)
    expect(shouldShowEndStep(item)).toBe(true)
  })

  it('executes queued proposals after eta', () => {
    const item = proposal(PROPOSAL_STATES.QUEUED, { executionETA: 100 })

    expect(isQueuedReadyToExecute(item, 100)).toBe(true)
    expect(canExecuteProposal(item, 100)).toBe(true)
  })

  it('does not show a queue step for optimistic executed proposals', () => {
    const item = proposal(PROPOSAL_STATES.EXECUTED, { isOptimistic: true })

    expect(shouldShowQueueStep(item)).toBe(false)
    expect(shouldShowEndStep(item)).toBe(true)
  })
})
