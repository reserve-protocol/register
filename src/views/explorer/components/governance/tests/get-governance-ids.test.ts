import { describe, expect, it } from 'vitest'
import { getAddress } from 'viem'
import {
  getGovernanceIds,
  getGovernanceToDTFs,
  getIndexProposalState,
} from '../use-proposals-data'

describe('getGovernanceIds', () => {
  it('includes current, staking-token, and legacy governance sources', () => {
    expect(
      getGovernanceIds({
        id: '0x0000000000000000000000000000000000000001',
        ownerGovernance: {
          id: '0x0000000000000000000000000000000000000010',
        },
        tradingGovernance: {
          id: '0x0000000000000000000000000000000000000020',
        },
        stToken: {
          governance: {
            id: '0x0000000000000000000000000000000000000030',
          },
          legacyGovernance: ['0x0000000000000000000000000000000000000035'],
        },
        legacyTradingGovernances: [
          { id: '0x000000000000000000000000000000000000004A' },
        ],
        legacyAdminGovernances: [
          { id: '0x0000000000000000000000000000000000000050' },
          { id: '0x0000000000000000000000000000000000000020' },
          { id: '0x000000000000000000000000000000000000004a' },
        ],
      })
    ).toEqual([
      '0x0000000000000000000000000000000000000010',
      '0x0000000000000000000000000000000000000020',
      '0x0000000000000000000000000000000000000030',
      '0x0000000000000000000000000000000000000035',
      '0x000000000000000000000000000000000000004a',
      '0x0000000000000000000000000000000000000050',
    ])
  })

  // Folio 6.0: `upgradeFolio` moves `stToken` to the successor vault, so the old vault's governor is only reachable through the replaced admin governor.
  it('includes the governor of a vote-lock vault replaced by a governance migration', () => {
    const oldAdminGovernor = '0x00000000000000000000000000000000000000A1'
    const oldVaultGovernor = '0x00000000000000000000000000000000000000B2'

    expect(
      getGovernanceIds({
        id: '0x0000000000000000000000000000000000000001',
        ownerGovernance: { id: '0x0000000000000000000000000000000000000010' },
        stToken: {
          governance: { id: '0x0000000000000000000000000000000000000030' },
          legacyGovernance: [],
        },
        legacyAdmins: ['0x00000000000000000000000000000000000000C3'],
        legacyAuctionApprovers: ['0x00000000000000000000000000000000000000D4'],
        legacyAdminGovernances: [
          { id: oldAdminGovernor, token: { governance: { id: oldVaultGovernor } } },
          { id: '0x00000000000000000000000000000000000000E5', token: {} },
        ],
      })
    ).toEqual([
      '0x0000000000000000000000000000000000000010',
      '0x0000000000000000000000000000000000000030',
      oldAdminGovernor.toLowerCase(),
      oldVaultGovernor.toLowerCase(),
      '0x00000000000000000000000000000000000000e5',
      '0x00000000000000000000000000000000000000c3',
      '0x00000000000000000000000000000000000000d4',
    ])
  })

  it('keeps every listed DTF that shares a governance', () => {
    const sharedGovernance = '0x00000000000000000000000000000000000000AA'
    const dtfA = {
      address: getAddress('0x0000000000000000000000000000000000000001'),
      symbol: 'A',
    }
    const dtfB = {
      address: getAddress('0x0000000000000000000000000000000000000002'),
      symbol: 'B',
    }

    const governanceToDTFs = getGovernanceToDTFs(
      [
        { id: dtfA.address, stToken: { governance: { id: sharedGovernance } } },
        { id: dtfB.address, stToken: { governance: { id: sharedGovernance } } },
        {
          id: '0x0000000000000000000000000000000000000003',
          stToken: { governance: { id: sharedGovernance } },
        },
      ],
      new Map([
        [dtfA.address.toLowerCase(), dtfA],
        [dtfB.address.toLowerCase(), dtfB],
      ])
    )

    expect(governanceToDTFs.get(sharedGovernance.toLowerCase())).toEqual([
      dtfA,
      dtfB,
    ])
  })

  it('uses optimistic veto context when deriving a terminal summary state', () => {
    const state = getIndexProposalState(
      {
        id: '1',
        description: '',
        creationTime: '1',
        state: 'ACTIVE',
        isOptimistic: true,
        forWeightedVotes: '0',
        againstWeightedVotes: '500',
        abstainWeightedVotes: '0',
        quorumVotes: '0',
        voteStart: '100',
        voteEnd: '200',
        vetoThreshold: '100000000000000000',
        vetoThresholdVotes: '1000',
        optimisticSnapshotSupply: '10000',
        governance: { id: '0x0000000000000000000000000000000000000001' },
        votes: [],
      },
      201
    )

    expect(state?.state).toBe('SUCCEEDED')
  })

  it('drops optimistic summaries without veto context', () => {
    expect(
      getIndexProposalState(
        {
          id: '2',
          description: '',
          creationTime: '1',
          state: 'ACTIVE',
          isOptimistic: true,
          forWeightedVotes: '0',
          againstWeightedVotes: '500',
          abstainWeightedVotes: '0',
          quorumVotes: '0',
          voteStart: '100',
          voteEnd: '200',
          governance: { id: '0x0000000000000000000000000000000000000001' },
          votes: [],
        },
        201
      )
    ).toBeUndefined()
  })
})
