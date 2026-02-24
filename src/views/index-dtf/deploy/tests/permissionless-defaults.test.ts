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
  TRUSTED_ADDRESSES,
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

  it('has correct fees', () => {
    const defaults = getPermissionlessDefaults(8453)
    expect(defaults.folioFee).toBe(0.15)
    expect(defaults.mintFee).toBe(0.15)
  })

  it('has weight control enabled', () => {
    expect(getPermissionlessDefaults(8453).weightControl).toBe(true)
  })

  it('has correct basket governance timing (hours)', () => {
    const defaults = getPermissionlessDefaults(8453)
    expect(defaults.basketVotingDelay).toBe(0)
    expect(defaults.basketVotingPeriod).toBe(24)
    expect(defaults.basketVotingThreshold).toBe(1)
    expect(defaults.basketVotingQuorum).toBe(3)
    expect(defaults.basketExecutionDelay).toBe(24)
  })

  it('has correct non-basket governance timing (days)', () => {
    const defaults = getPermissionlessDefaults(8453)
    expect(defaults.governanceVotingDelay).toBe(0)
    expect(defaults.governanceVotingPeriod).toBe(1)
    expect(defaults.governanceVotingThreshold).toBe(1)
    expect(defaults.governanceVotingQuorum).toBe(3)
    expect(defaults.governanceExecutionDelay).toBe(1)
  })

  it('assigns trusted addresses to guardians and auctionLaunchers', () => {
    const defaults = getPermissionlessDefaults(8453)
    const trusted = TRUSTED_ADDRESSES[8453]

    expect(defaults.guardians).toEqual(trusted)
    expect(defaults.auctionLaunchers).toEqual(trusted)
    expect(defaults.guardians).toHaveLength(4)
  })

  it('brandManagers defaults to empty (wallet injected by updater)', () => {
    const defaults = getPermissionlessDefaults(8453)
    expect(defaults.brandManagers).toEqual([])
  })

  it('defaults inputType to share', () => {
    expect(getPermissionlessDefaults(8453).inputType).toBe('share')
  })

  it('has empty basket and recipients', () => {
    const defaults = getPermissionlessDefaults(8453)
    expect(defaults.tokensDistribution).toEqual([])
    expect(defaults.additionalRevenueRecipients).toEqual([])
  })

  it('auction length is 30 minutes', () => {
    expect(getPermissionlessDefaults(8453).auctionLength).toBe(30)
  })

  it('bids are enabled', () => {
    expect(getPermissionlessDefaults(8453).bidsEnabled).toBe(true)
  })
})
