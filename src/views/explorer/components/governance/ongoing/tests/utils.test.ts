import { describe, expect, it } from 'vitest'
import { encodeFunctionData, zeroAddress } from 'viem'
import {
  dtfIndexGovernanceProposalAbi,
  timelockAbi,
} from '@reserve-protocol/react-sdk'
import {
  calculateProposalGaps,
  classifyProposal,
  formatUsdAmount,
  type ProposalContractContext,
} from '../utils'

const dtfAddress = '0x0000000000000000000000000000000000000001'
const governanceAddress = '0x0000000000000000000000000000000000000002'
const timelockAddress = '0x0000000000000000000000000000000000000003'

const context: ProposalContractContext = {
  rebalanceTargets: new Set([dtfAddress]),
  trustedTargets: new Set([dtfAddress, governanceAddress, timelockAddress]),
}

describe('calculateProposalGaps', () => {
  it('accounts for participation quorum and the strict for-vote majority', () => {
    expect(
      calculateProposalGaps({
        state: 'ACTIVE',
        isOptimistic: false,
        quorum: 100n,
        forVotes: 40n,
        againstVotes: 60n,
        abstainVotes: 30n,
      })
    ).toEqual({
      threshold: 30n,
      pass: 30n,
      defeat: 0n,
    })
  })

  it('requires one vote to pass a tied standard proposal', () => {
    expect(
      calculateProposalGaps({
        state: 'ACTIVE',
        isOptimistic: false,
        quorum: 10n,
        forVotes: 10n,
        againstVotes: 10n,
        abstainVotes: 0n,
      })
    ).toEqual({
      threshold: 0n,
      pass: 1n,
      defeat: 0n,
    })
  })

  it('uses the veto target for optimistic proposals', () => {
    expect(
      calculateProposalGaps({
        state: 'ACTIVE',
        isOptimistic: true,
        quorum: 0n,
        forVotes: 0n,
        againstVotes: 25n,
        abstainVotes: 0n,
        optimisticTarget: 100n,
      })
    ).toEqual({
      threshold: 75n,
      pass: 0n,
      defeat: 75n,
    })
  })

  it('marks unresolved optimistic and pending zero targets unavailable', () => {
    expect(
      calculateProposalGaps({
        state: 'ACTIVE',
        isOptimistic: true,
        quorum: 0n,
        forVotes: 0n,
        againstVotes: 0n,
        abstainVotes: 0n,
      })
    ).toEqual({
      threshold: undefined,
      pass: undefined,
      defeat: undefined,
    })

    expect(
      calculateProposalGaps({
        state: 'PENDING',
        isOptimistic: false,
        quorum: 0n,
        forVotes: 0n,
        againstVotes: 0n,
        abstainVotes: 0n,
      })
    ).toEqual({
      threshold: undefined,
      pass: undefined,
      defeat: 0n,
    })
  })
})

describe('classifyProposal', () => {
  it('gives startRebalance precedence over critical settings', () => {
    const critical = encodeFunctionData({
      abi: timelockAbi,
      functionName: 'updateDelay',
      args: [1n],
    })
    const rebalance = '0x207c8eed'

    expect(
      classifyProposal(
        [timelockAddress, dtfAddress],
        [critical, rebalance],
        context
      )
    ).toBe('rebalance')
  })

  it('classifies role grants and governance setters as critical', () => {
    const grantRole = encodeFunctionData({
      abi: timelockAbi,
      functionName: 'grantRole',
      args: [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        zeroAddress,
      ],
    })
    const setVotingPeriod = encodeFunctionData({
      abi: dtfIndexGovernanceProposalAbi,
      functionName: 'setVotingPeriod',
      args: [3600],
    })

    expect(
      classifyProposal(
        [timelockAddress, governanceAddress],
        [grantRole, setVotingPeriod],
        context
      )
    ).toBe('critical')
  })

  it('unwraps one governor relay level', () => {
    const innerCall = '0x207c8eed'
    const relay = encodeFunctionData({
      abi: dtfIndexGovernanceProposalAbi,
      functionName: 'relay',
      args: [dtfAddress, 0n, innerCall],
    })

    expect(classifyProposal([governanceAddress], [relay], context)).toBe(
      'rebalance'
    )
  })

  it('does not trust selector matches on unknown targets', () => {
    const grantRole = encodeFunctionData({
      abi: timelockAbi,
      functionName: 'grantRole',
      args: [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        zeroAddress,
      ],
    })

    expect(
      classifyProposal(
        ['0x0000000000000000000000000000000000000004'],
        [grantRole],
        context
      )
    ).toBe('other')
  })

  it('formats USD values without converting raw token amounts to Number', () => {
    expect(formatUsdAmount(123456789n, 6, 2.5)).toBe('$308.64')
    expect(formatUsdAmount(1n, 18, 1)).toBe('< $0.01')
  })

  it('treats missing, zero, and invalid prices as unavailable', () => {
    expect(formatUsdAmount(100n, 2, undefined)).toBeUndefined()
    expect(formatUsdAmount(100n, 2, 0)).toBeUndefined()
    expect(formatUsdAmount(100n, 2, Number.NaN)).toBeUndefined()
  })
})
