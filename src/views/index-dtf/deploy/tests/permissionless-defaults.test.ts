import { describe, it, expect, vi } from 'vitest'

vi.mock('@/utils/chains', () => ({
  ChainId: { Mainnet: 1, Base: 8453, BSC: 56 },
}))

vi.mock('@/utils/constants', () => ({
  getPlatformFee: (chainId: number) => (chainId === 56 ? 33 : 50),
}))

import {
  getPermissionlessDefaults,
  PERMISSIONLESS_VOTE_LOCK,
} from '../permissionless-defaults'

describe('getPermissionlessDefaults', () => {
  it('returns valid defaults for Base', () => {
    const defaults = getPermissionlessDefaults(8453)

    expect(defaults.chain).toBe(8453)
    expect(defaults.governanceVoteLock).toBe(PERMISSIONLESS_VOTE_LOCK[8453])
    expect(defaults.governanceERC20address).toBeUndefined()
    expect(defaults.governanceWalletAddress).toBeUndefined()
  })

  it('revenue shares sum to 100% with platform fee', () => {
    const defaults = getPermissionlessDefaults(8453)
    const total =
      defaults.governanceShare +
      defaults.deployerShare +
      defaults.fixedPlatformFee

    expect(total).toBe(100)
  })

  it('revenue shares sum to 100% on BSC (different platform fee)', () => {
    const defaults = getPermissionlessDefaults(56)
    const total =
      defaults.governanceShare +
      defaults.deployerShare +
      defaults.fixedPlatformFee

    expect(total).toBe(100)
  })

  it('deployer share is always 0', () => {
    expect(getPermissionlessDefaults(1).deployerShare).toBe(0)
    expect(getPermissionlessDefaults(8453).deployerShare).toBe(0)
    expect(getPermissionlessDefaults(56).deployerShare).toBe(0)
  })

  it('assigns operator to all role arrays', () => {
    const defaults = getPermissionlessDefaults(8453)

    expect(defaults.guardians).toHaveLength(1)
    expect(defaults.brandManagers).toHaveLength(1)
    expect(defaults.auctionLaunchers).toHaveLength(1)
    // All three use the same operator
    expect(defaults.guardians[0]).toBe(defaults.brandManagers[0])
    expect(defaults.brandManagers[0]).toBe(defaults.auctionLaunchers[0])
  })

  it('has empty basket and recipients', () => {
    const defaults = getPermissionlessDefaults(8453)
    expect(defaults.tokensDistribution).toEqual([])
    expect(defaults.additionalRevenueRecipients).toEqual([])
  })
})
