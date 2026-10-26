import { parseEther, type Address } from 'viem'
import { describe, expect, it } from 'vitest'
import { INDEX_DTF_START_REBALANCE_SELECTOR } from '@reserve-protocol/react-sdk'
import { dtfDeployDefaultValues, type DeployInputs } from '../../form-fields'
import {
  buildV6DeployParams,
  resolveGovernanceRecipient,
} from '../v6-deploy-params'

const DEPLOYER = '0x1111111111111111111111111111111111111111' as Address
const JAR = '0x2222222222222222222222222222222222222222' as Address
const EXTRA = '0x3333333333333333333333333333333333333333' as Address
const PERMANENT = '0x4444444444444444444444444444444444444444' as Address
const GUARDIAN = '0x5555555555555555555555555555555555555555' as Address
const PROPOSER = '0x6666666666666666666666666666666666666666' as Address

const inputs = (patch: Partial<DeployInputs> = {}): DeployInputs => ({
  ...dtfDeployDefaultValues,
  mandate: 'Track things',
  folioFee: 2,
  mintFee: 0.3,
  fixedPlatformFee: 50,
  ...patch,
})

const build = (patch: Partial<DeployInputs> = {}) =>
  buildV6DeployParams(inputs(patch), {
    deployer: DEPLOYER,
    governanceRecipient: JAR,
  })

const total = (recipients: readonly { portion: bigint }[]) =>
  recipients.reduce((sum, r) => sum + r.portion, 0n)

describe('buildV6DeployParams fees', () => {
  it('splits a governance + creator revenue into one mutable table that sums to 1e18', () => {
    const { additionalDetails } = build({
      governanceShare: 30,
      deployerShare: 20,
    })
    expect(additionalDetails.selfFee).toBe(0n)
    expect(additionalDetails.immutableFeeRecipients).toEqual([])
    expect(additionalDetails.feeRecipients).toEqual([
      { recipient: DEPLOYER, portion: parseEther('0.4') },
      { recipient: JAR, portion: parseEther('0.6') },
    ])
  })

  it('takes the holder share as the self fee and splits the rest across both tables', () => {
    const { additionalDetails } = build({
      holderShare: 10,
      governanceShare: 20,
      deployerShare: 0,
      additionalRevenueRecipients: [{ address: EXTRA, share: 10 }],
      permanentRevenueRecipients: [{ address: PERMANENT, share: 10 }],
    })
    // Non-platform 50%: holders 10 → 0.2; the remaining 40% split 20/10/10.
    expect(additionalDetails.selfFee).toBe(parseEther('0.2'))
    expect(additionalDetails.feeRecipients).toEqual([
      { recipient: JAR, portion: parseEther('0.5') },
      { recipient: EXTRA, portion: parseEther('0.25') },
    ])
    expect(additionalDetails.immutableFeeRecipients).toEqual([
      { recipient: PERMANENT, portion: parseEther('0.25') },
    ])
  })

  it('puts the rounding residual on the last recipient so both tables sum to exactly 1e18', () => {
    const { additionalDetails } = build({
      fixedPlatformFee: 100 / 3,
      governanceShare: 22.22,
      deployerShare: 22.22,
      permanentRevenueRecipients: [{ address: PERMANENT, share: 22.23 }],
    })
    expect(
      total(additionalDetails.feeRecipients) +
        total(additionalDetails.immutableFeeRecipients)
    ).toBe(parseEther('1'))
  })

  it('refuses a governance share without a vault instead of handing it to the last recipient', () => {
    expect(() =>
      buildV6DeployParams(
        inputs({
          governanceShare: 20,
          deployerShare: 20,
          permanentRevenueRecipients: [{ address: PERMANENT, share: 10 }],
        }),
        { deployer: DEPLOYER }
      )
    ).toThrow(/governance share/i)
  })

  it('refuses shares that do not add up to the revenue left after the platform and holders', () => {
    expect(() => build({ governanceShare: 30, deployerShare: 10 })).toThrow(
      /add up/i
    )
  })

  it('drops zero shares instead of sending a zero portion', () => {
    const { additionalDetails } = build({
      governanceShare: 50,
      deployerShare: 0,
      additionalRevenueRecipients: [{ address: EXTRA, share: 0 }],
    })
    expect(additionalDetails.feeRecipients).toEqual([
      { recipient: JAR, portion: parseEther('1') },
    ])
  })

  it('sends no recipients when holders take the whole non-platform share', () => {
    const { additionalDetails } = build({ holderShare: 50 })
    expect(additionalDetails.selfFee).toBe(parseEther('1'))
    expect(additionalDetails.feeRecipients).toEqual([])
    expect(additionalDetails.immutableFeeRecipients).toEqual([])
  })

  it('converts fees and the max auction length', () => {
    const { additionalDetails } = build({
      governanceShare: 50,
      maxAuctionLength: 30,
    })
    expect(additionalDetails.tvlFee).toBe(parseEther('0.02'))
    expect(additionalDetails.mintFee).toBe(parseEther('0.003'))
    expect(additionalDetails.maxAuctionLength).toBe(1800n)
    expect(additionalDetails.mandate).toBe('Track things')
  })
})

describe('buildV6DeployParams governance', () => {
  it('maps the form to one optimistic governance table in seconds and D18', () => {
    const { governance } = build({
      governanceShare: 50,
      guardians: [GUARDIAN, ''],
      optimisticProposers: [PROPOSER, ''],
      optimisticActions: ['startRebalance', 'setMandate'],
    })
    expect(governance).toEqual({
      optimistic: {
        vetoDelay: 14_400n,
        vetoPeriod: 72_000n,
        vetoThreshold: parseEther('0.01'),
      },
      standard: {
        votingDelay: 172_800n,
        votingPeriod: 259_200n,
        voteExtension: 172_800n,
        proposalThreshold: parseEther('0.0001'),
        quorumNumerator: parseEther('0.1'),
      },
      optimisticSelectors: [
        INDEX_DTF_START_REBALANCE_SELECTOR['6.0.0'],
        '0x9f200bba',
      ],
      optimisticProposers: [PROPOSER],
      additionalGuardians: [GUARDIAN],
      timelockDelay: 172_800n,
      proposalThrottleCapacity: 3n,
    })
  })

  it('maps roles and flags', () => {
    const { roles, flags } = build({
      governanceShare: 50,
      auctionLaunchers: [GUARDIAN, ''],
      brandManagers: [PROPOSER],
      weightControl: true,
      bidsEnabled: false,
    })
    expect(roles).toEqual({
      existingBasketManagers: [],
      auctionLaunchers: [GUARDIAN],
      brandManagers: [PROPOSER],
    })
    expect(flags).toEqual({
      trustedFillerEnabled: true,
      rebalanceControl: { weightControl: true, priceControl: 1 },
      bidsEnabled: false,
    })
  })
})

describe('resolveGovernanceRecipient', () => {
  const VAULT = '0x7777777777777777777777777777777777777777' as Address

  it('is ready without a vault, waits for the jar, then routes to it', () => {
    expect(resolveGovernanceRecipient(undefined, undefined)).toEqual({ ready: true })
    expect(resolveGovernanceRecipient(VAULT, undefined).ready).toBe(false)
    expect(resolveGovernanceRecipient(VAULT, { stToken: VAULT }).ready).toBe(false)
    expect(resolveGovernanceRecipient(VAULT, { stToken: VAULT, tokenJar: JAR })).toEqual({
      ready: true,
      recipient: JAR,
    })
  })

  it('ignores a jar read for a different vault and blocks on a zero or unreadable jar', () => {
    expect(resolveGovernanceRecipient(VAULT, { stToken: EXTRA, tokenJar: JAR }).ready).toBe(false)
    expect(
      resolveGovernanceRecipient(VAULT, {
        stToken: VAULT,
        tokenJar: '0x0000000000000000000000000000000000000000',
      }).error
    ).toMatch(/token jar/)
    expect(resolveGovernanceRecipient(VAULT, { stToken: VAULT, error: 'reverted' }).error).toBe(
      'reverted'
    )
  })
})
