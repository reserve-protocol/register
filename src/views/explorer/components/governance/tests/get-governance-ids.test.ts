import { describe, expect, it } from 'vitest'
import { getAddress } from 'viem'
import { getGovernanceIds, getGovernanceToDTFs } from '../use-proposals-data'

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
})
