import { describe, expect, it } from 'vitest'
import { getGovernanceIds } from '../use-proposals-data'

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
          { id: '0x0000000000000000000000000000000000000040' },
        ],
        legacyAdminGovernances: [
          { id: '0x0000000000000000000000000000000000000050' },
          { id: '0x0000000000000000000000000000000000000020' },
        ],
      })
    ).toEqual([
      '0x0000000000000000000000000000000000000010',
      '0x0000000000000000000000000000000000000020',
      '0x0000000000000000000000000000000000000030',
      '0x0000000000000000000000000000000000000035',
      '0x0000000000000000000000000000000000000040',
      '0x0000000000000000000000000000000000000050',
    ])
  })
})
