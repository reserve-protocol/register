import { describe, expect, it } from 'vitest'
import {
  REBALANCE_DEADLINE_BUFFER,
  getRebalanceProposalDeadline,
} from '../rebalance-deadline'

const standard = {
  votingDelay: 86_400n,
  votingPeriod: 259_200n,
  voteExtension: 172_800n,
  timelockDelay: 172_800n,
}

describe('getRebalanceProposalDeadline', () => {
  it('covers the standard vote, the late-quorum extension, the timelock and the buffer', () => {
    expect(getRebalanceProposalDeadline(1_000n, standard)).toBe(
      1_000n +
        86_400n +
        259_200n +
        172_800n +
        172_800n +
        REBALANCE_DEADLINE_BUFFER
    )
  })

  it('adds the late-quorum extension so a vote extended by a late quorum can still execute', () => {
    expect(
      getRebalanceProposalDeadline(1_000n, standard) -
        getRebalanceProposalDeadline(1_000n, { ...standard, voteExtension: 0n })
    ).toBe(172_800n)
  })

  it('adds the veto window on optimistic governors so a vetoed proposal can still pass its confirmation vote', () => {
    expect(
      getRebalanceProposalDeadline(1_000n, {
        ...standard,
        veto: { vetoDelay: 43_200n, vetoPeriod: 129_600n },
      })
    ).toBe(getRebalanceProposalDeadline(1_000n, standard) + 43_200n + 129_600n)
  })

  it('uses a one-week buffer', () => {
    expect(REBALANCE_DEADLINE_BUFFER).toBe(604_800n)
  })
})
