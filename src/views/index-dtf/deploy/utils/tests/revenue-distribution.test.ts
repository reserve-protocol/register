import { describe, it, expect, vi } from 'vitest'
import { parseEther, Address } from 'viem'

// Mock modules with side-effectful imports
vi.mock('@/state/atoms', () => ({
  GRAPH_CLIENTS: {},
  INDEX_GRAPH_CLIENTS: {},
}))

vi.mock('@/state/chain', () => ({
  wagmiConfig: {},
}))

vi.mock('@/utils/chains', () => ({
  ChainId: { Mainnet: 1, Base: 8453, BSC: 56, Arbitrum: 42161 },
}))

vi.mock('@/utils/constants', () => ({
  getPlatformFee: (chainId: number) => (chainId === 56 ? 33 : 50),
}))

// Mock the FeeRecipient import source (only exports types we need)
vi.mock(
  '../../steps/confirm-deploy/manual/components/confirm-manual-deploy-button',
  () => ({})
)

// Mock form-fields (only used for DeployInputs type)
vi.mock('../../form-fields', () => ({}))

import { calculateRevenueDistribution } from '../index'
import { DeployInputs } from '../../form-fields'

const WALLET = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Address
const ST_TOKEN = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as Address
const RECIPIENT_1 = '0xcccccccccccccccccccccccccccccccccccccccc' as Address
const RECIPIENT_2 = '0xdddddddddddddddddddddddddddddddddddddd' as Address

const baseFormData = {
  governanceShare: 50,
  deployerShare: 0,
  fixedPlatformFee: 50,
  additionalRevenueRecipients: [],
} as unknown as DeployInputs

describe('calculateRevenueDistribution', () => {
  it('returns single recipient for governance-only share', () => {
    const result = calculateRevenueDistribution(
      { ...baseFormData, governanceShare: 50, deployerShare: 0 } as DeployInputs,
      WALLET,
      ST_TOKEN
    )

    expect(result).toHaveLength(1)
    expect(result[0].recipient).toBe(ST_TOKEN)
    expect(result[0].portion).toBe(parseEther('1'))
  })

  it('splits between deployer and governance', () => {
    const data = {
      ...baseFormData,
      governanceShare: 25,
      deployerShare: 25,
    } as DeployInputs

    const result = calculateRevenueDistribution(data, WALLET, ST_TOKEN)

    expect(result).toHaveLength(2)

    // All portions should sum to 1 ether (100%)
    const totalPortion = result.reduce((sum, r) => sum + r.portion, 0n)
    expect(totalPortion).toBe(parseEther('1'))
  })

  it('includes additional recipients', () => {
    const data = {
      ...baseFormData,
      governanceShare: 30,
      deployerShare: 10,
      additionalRevenueRecipients: [{ address: RECIPIENT_1, share: 10 }],
    } as DeployInputs

    const result = calculateRevenueDistribution(data, WALLET, ST_TOKEN)

    expect(result).toHaveLength(3)
    const totalPortion = result.reduce((sum, r) => sum + r.portion, 0n)
    expect(totalPortion).toBe(parseEther('1'))
  })

  it('handles deployer share = 0 (no deployer entry)', () => {
    const data = {
      ...baseFormData,
      governanceShare: 50,
      deployerShare: 0,
    } as DeployInputs

    const result = calculateRevenueDistribution(data, WALLET, ST_TOKEN)
    const walletRecipient = result.find((r) => r.recipient === WALLET)
    expect(walletRecipient).toBeUndefined()
  })

  it('handles governance share = 0 without stToken', () => {
    const data = {
      ...baseFormData,
      governanceShare: 0,
      deployerShare: 50,
    } as DeployInputs

    const result = calculateRevenueDistribution(data, WALLET, undefined)

    expect(result).toHaveLength(1)
    expect(result[0].recipient).toBe(WALLET)
    expect(result[0].portion).toBe(parseEther('1'))
  })

  it('sorts recipients by address (lowercase)', () => {
    const data = {
      ...baseFormData,
      governanceShare: 20,
      deployerShare: 10,
      additionalRevenueRecipients: [
        { address: RECIPIENT_2, share: 10 },
        { address: RECIPIENT_1, share: 10 },
      ],
    } as DeployInputs

    const result = calculateRevenueDistribution(data, WALLET, ST_TOKEN)

    const addresses = result.map((r) => r.recipient.toLowerCase())
    const sorted = [...addresses].sort()
    expect(addresses).toEqual(sorted)
  })

  it('last recipient gets remainder to ensure exact sum', () => {
    // With uneven splits, the last recipient should absorb rounding
    const data = {
      ...baseFormData,
      governanceShare: 17,
      deployerShare: 17,
      additionalRevenueRecipients: [{ address: RECIPIENT_1, share: 16 }],
    } as DeployInputs

    const result = calculateRevenueDistribution(data, WALLET, ST_TOKEN)

    const totalPortion = result.reduce((sum, r) => sum + r.portion, 0n)
    expect(totalPortion).toBe(parseEther('1'))
  })

  it('applies denominator based on platform fee', () => {
    // platformFee = 50 → denominator = (100-50)/100 = 0.5
    // governanceShare = 50 → share = 50/100 = 0.5 → portion = 0.5/0.5 = 1.0
    const data = {
      ...baseFormData,
      governanceShare: 50,
      deployerShare: 0,
      fixedPlatformFee: 50,
    } as DeployInputs

    const result = calculateRevenueDistribution(data, WALLET, ST_TOKEN)
    expect(result[0].portion).toBe(parseEther('1'))
  })
})
