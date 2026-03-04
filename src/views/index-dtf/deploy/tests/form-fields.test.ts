import { describe, it, expect, vi } from 'vitest'
import { isAddress } from 'viem'

// Mock modules with side-effectful imports before importing the schema
vi.mock('@/utils/chains', () => ({
  ChainId: { Mainnet: 1, Base: 8453, BSC: 56, Arbitrum: 42161 },
}))

vi.mock('@/utils/constants', () => ({
  getPlatformFee: (chainId: number) => (chainId === 56 ? 33 : 50),
}))

// Mock async validators (network calls) while keeping pure functions real
vi.mock('../utils', () => ({
  isAddressNotStrict: (address: string) => isAddress(address, { strict: false }),
  isERC20: vi.fn().mockResolvedValue(true),
  isVoteLockAddress: vi.fn().mockResolvedValue(true),
  isNotVoteLockAddress: vi.fn().mockResolvedValue(true),
  isNotStRSR: vi.fn().mockResolvedValue(true),
  noSpecialCharacters: (value: string) => {
    const alphanumericWithSpaces = /^[a-zA-Z0-9\s.\-/&]*$/
    const containsEmoji =
      /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u
    if (containsEmoji.test(value)) return false
    return alphanumericWithSpaces.test(value)
  },
}))

import { DeployFormSchema } from '../form-fields'

// Test addresses (enough for large basket tests)
const ADDR_1 = '0x1111111111111111111111111111111111111111'
const ADDR_2 = '0x2222222222222222222222222222222222222222'
const ADDR_3 = '0x3333333333333333333333333333333333333333'
const ADDR_4 = '0x4444444444444444444444444444444444444444'
const ADDR_5 = '0x5555555555555555555555555555555555555555'
const ADDR_6 = '0x6666666666666666666666666666666666666666'
const ADDR_7 = '0x7777777777777777777777777777777777777777'
const ADDR_8 = '0x8888888888888888888888888888888888888888'
const ADDR_9 = '0x9999999999999999999999999999999999999999'
const ADDR_10 = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const ALL_ADDRS = [ADDR_1, ADDR_2, ADDR_3, ADDR_4, ADDR_5, ADDR_6, ADDR_7, ADDR_8, ADDR_9, ADDR_10]

// Base valid form data - passes all validations
const validFormData = () => ({
  tokenName: 'Test Token',
  symbol: 'TEST',
  mandate: '',
  chain: 1,
  initialValue: 1,
  inputType: 'unit',
  tokensDistribution: [{ address: ADDR_1, percentage: 100 }],
  governanceWalletAddress: ADDR_1,
  governanceERC20address: undefined,
  governanceVoteLock: undefined,
  folioFee: 1,
  mintFee: 0.5,
  governanceShare: 50,
  deployerShare: 0,
  fixedPlatformFee: 50,
  additionalRevenueRecipients: [],
  auctionLength: 30,
  weightControl: false,
  bidsEnabled: true,
  guardians: [],
  brandManagers: [],
  auctionLaunchers: [],
  basketVotingDelay: 48,
  basketVotingPeriod: 72,
  basketVotingThreshold: 0.01,
  basketVotingQuorum: 10,
  basketExecutionDelay: 48,
  governanceVotingDelay: 2,
  governanceVotingPeriod: 3,
  governanceVotingThreshold: 0.01,
  governanceVotingQuorum: 10,
  governanceExecutionDelay: 2,
})

const parse = (data: Record<string, unknown>) =>
  DeployFormSchema.safeParseAsync(data)

const getErrors = async (data: Record<string, unknown>) => {
  const result = await parse(data)
  if (result.success) return []
  return result.error.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }))
}

const hasError = async (data: Record<string, unknown>, path: string) => {
  const errors = await getErrors(data)
  return errors.some((e) => e.path === path)
}

describe('DeployFormSchema', () => {
  it('passes with valid data', async () => {
    const result = await parse(validFormData())
    expect(result.success).toBe(true)
  })

  // --- Field-level validations ---

  describe('tokenName', () => {
    it('rejects empty name', async () => {
      expect(await hasError({ ...validFormData(), tokenName: '' }, 'tokenName')).toBe(true)
    })

    it('rejects name over 80 characters', async () => {
      const longName = 'A'.repeat(81)
      expect(await hasError({ ...validFormData(), tokenName: longName }, 'tokenName')).toBe(true)
    })

    it('rejects special characters', async () => {
      expect(await hasError({ ...validFormData(), tokenName: 'Test@Token' }, 'tokenName')).toBe(true)
    })

    it('allows alphanumeric with spaces and dots', async () => {
      const data = { ...validFormData(), tokenName: 'My Token v2.0' }
      expect(await hasError(data, 'tokenName')).toBe(false)
    })
  })

  describe('symbol', () => {
    it('rejects empty symbol', async () => {
      expect(await hasError({ ...validFormData(), symbol: '' }, 'symbol')).toBe(true)
    })

    it('rejects symbol over 12 characters', async () => {
      expect(await hasError({ ...validFormData(), symbol: 'TOOLONGSYMBOL' }, 'symbol')).toBe(true)
    })

    it('rejects spaces', async () => {
      expect(await hasError({ ...validFormData(), symbol: 'MY TKN' }, 'symbol')).toBe(true)
    })
  })

  describe('fees', () => {
    it('rejects folioFee below 0.15%', async () => {
      expect(await hasError({ ...validFormData(), folioFee: 0.1 }, 'folioFee')).toBe(true)
    })

    it('rejects folioFee above 10%', async () => {
      expect(await hasError({ ...validFormData(), folioFee: 11 }, 'folioFee')).toBe(true)
    })

    it('rejects mintFee below 0.15%', async () => {
      expect(await hasError({ ...validFormData(), mintFee: 0.1 }, 'mintFee')).toBe(true)
    })

    it('rejects mintFee above 5%', async () => {
      expect(await hasError({ ...validFormData(), mintFee: 6 }, 'mintFee')).toBe(true)
    })

    it('accepts valid fee values', async () => {
      const data = { ...validFormData(), folioFee: 0.15, mintFee: 0.15 }
      expect(await hasError(data, 'folioFee')).toBe(false)
      expect(await hasError(data, 'mintFee')).toBe(false)
    })
  })

  describe('auctionLength', () => {
    it('rejects above 45 minutes', async () => {
      expect(await hasError({ ...validFormData(), auctionLength: 46 }, 'auctionLength')).toBe(true)
    })

    it('accepts 45 minutes', async () => {
      expect(await hasError({ ...validFormData(), auctionLength: 45 }, 'auctionLength')).toBe(false)
    })
  })

  // --- Token distribution (superRefine) ---

  describe('token distribution - percentage mode', () => {
    const percentageData = () => ({
      ...validFormData(),
      inputType: 'percentage',
    })

    const makeBasket = (allocations: [string, number][]) =>
      allocations.map(([address, percentage]) => ({ address, percentage }))

    it('two tokens: 60/40 split', async () => {
      const data = {
        ...percentageData(),
        tokensDistribution: makeBasket([[ADDR_1, 60], [ADDR_2, 40]]),
      }
      expect((await parse(data)).success).toBe(true)
    })

    it('single token at 100%', async () => {
      const data = {
        ...percentageData(),
        tokensDistribution: makeBasket([[ADDR_1, 100]]),
      }
      expect((await parse(data)).success).toBe(true)
    })

    it('five equal tokens at 20% each', async () => {
      const data = {
        ...percentageData(),
        tokensDistribution: makeBasket([
          [ADDR_1, 20], [ADDR_2, 20], [ADDR_3, 20], [ADDR_4, 20], [ADDR_5, 20],
        ]),
      }
      expect((await parse(data)).success).toBe(true)
    })

    it('ten equal tokens at 10% each', async () => {
      const data = {
        ...percentageData(),
        tokensDistribution: ALL_ADDRS.map((addr) => ({ address: addr, percentage: 10 })),
      }
      expect((await parse(data)).success).toBe(true)
    })

    // Real portfolio: mixed decimal allocations
    it('realistic portfolio: 25.5 + 15.75 + 30.25 + 28.5 = 100', async () => {
      const data = {
        ...percentageData(),
        tokensDistribution: makeBasket([
          [ADDR_1, 25.5], [ADDR_2, 15.75], [ADDR_3, 30.25], [ADDR_4, 28.5],
        ]),
      }
      expect((await parse(data)).success).toBe(true)
    })

    // Three-way split: user tries equal thirds
    it('three-way split: 33.33 + 33.33 + 33.34 = 100', async () => {
      const data = {
        ...percentageData(),
        tokensDistribution: makeBasket([
          [ADDR_1, 33.33], [ADDR_2, 33.33], [ADDR_3, 33.34],
        ]),
      }
      expect((await parse(data)).success).toBe(true)
    })

    // Large token with a tiny tail allocation
    it('dominant token with tiny tail: 99.99 + 0.01 = 100', async () => {
      const data = {
        ...percentageData(),
        tokensDistribution: makeBasket([[ADDR_1, 99.99], [ADDR_2, 0.01]]),
      }
      expect((await parse(data)).success).toBe(true)
    })

    // Classic JS floating point: 0.1 + 0.2 != 0.3 in IEEE 754
    // Summing many such values should still pass via Decimal epsilon
    it('floating point stress: ten values of 10.01 * 9 + 9.91 = 100', async () => {
      const data = {
        ...percentageData(),
        tokensDistribution: [
          ...ALL_ADDRS.slice(0, 9).map((addr) => ({ address: addr, percentage: 10.01 })),
          { address: ADDR_10, percentage: 9.91 },
        ],
      }
      expect((await parse(data)).success).toBe(true)
    })

    // Repeated 0.1 additions: classic JS float trap
    it('floating point: repeated 0.1 values (10 × 10.0) = 100', async () => {
      const data = {
        ...percentageData(),
        tokensDistribution: ALL_ADDRS.map((addr) => ({ address: addr, percentage: 10.0 })),
      }
      expect((await parse(data)).success).toBe(true)
    })

    // --- Failure cases with correct error messages ---

    it('fails: sum below 100 shows "missing" with correct amount', async () => {
      const data = {
        ...percentageData(),
        tokensDistribution: makeBasket([[ADDR_1, 60], [ADDR_2, 30]]),
      }
      const errors = await getErrors(data)
      const basketError = errors.find((e) => e.path === 'basket')
      expect(basketError).toBeDefined()
      expect(basketError!.message).toContain('10% missing')
    })

    it('fails: sum above 100 shows "excess" with correct amount', async () => {
      const data = {
        ...percentageData(),
        tokensDistribution: makeBasket([[ADDR_1, 70], [ADDR_2, 40]]),
      }
      const errors = await getErrors(data)
      const basketError = errors.find((e) => e.path === 'basket')
      expect(basketError).toBeDefined()
      expect(basketError!.message).toContain('10% excess')
    })

    // User typed 33.33 × 3 = 99.99, genuinely 0.01% short
    it('fails: three equal 33.33 values = 99.99 (0.01% missing)', async () => {
      const data = {
        ...percentageData(),
        tokensDistribution: makeBasket([
          [ADDR_1, 33.33], [ADDR_2, 33.33], [ADDR_3, 33.33],
        ]),
      }
      const errors = await getErrors(data)
      const basketError = errors.find((e) => e.path === 'basket')
      expect(basketError).toBeDefined()
      expect(basketError!.message).toContain('0.01% missing')
    })

    // User slightly over-allocated
    it('fails: slightly over at 100.01 (0.01% excess)', async () => {
      const data = {
        ...percentageData(),
        tokensDistribution: makeBasket([[ADDR_1, 50.01], [ADDR_2, 50]]),
      }
      const errors = await getErrors(data)
      const basketError = errors.find((e) => e.path === 'basket')
      expect(basketError).toBeDefined()
      expect(basketError!.message).toContain('0.01% excess')
    })
  })

  describe('token distribution - unit mode', () => {
    it('passes with positive numbers', async () => {
      const data = {
        ...validFormData(),
        inputType: 'unit',
        tokensDistribution: [
          { address: ADDR_1, percentage: 5 },
          { address: ADDR_2, percentage: 10 },
        ],
      }
      const result = await parse(data)
      expect(result.success).toBe(true)
    })

    it('fails when any unit is zero', async () => {
      const data = {
        ...validFormData(),
        inputType: 'unit',
        tokensDistribution: [
          { address: ADDR_1, percentage: 5 },
          { address: ADDR_2, percentage: 0 },
        ],
      }
      expect(await hasError(data, 'basket')).toBe(true)
    })

    it('fails when any unit is negative', async () => {
      const data = {
        ...validFormData(),
        inputType: 'unit',
        tokensDistribution: [
          { address: ADDR_1, percentage: -1 },
        ],
      }
      // negative triggers the .positive() check on the field itself
      expect(await hasError(data, 'tokensDistribution.0.percentage')).toBe(true)
    })
  })

  // --- Governance mutual exclusivity ---

  describe('governance validation', () => {
    it('passes with only wallet address', async () => {
      const data = {
        ...validFormData(),
        governanceWalletAddress: ADDR_1,
        governanceERC20address: undefined,
        governanceVoteLock: undefined,
      }
      const result = await parse(data)
      expect(result.success).toBe(true)
    })

    it('passes with only ERC20 address', async () => {
      const data = {
        ...validFormData(),
        governanceWalletAddress: undefined,
        governanceERC20address: ADDR_1,
        governanceVoteLock: undefined,
      }
      const result = await parse(data)
      expect(result.success).toBe(true)
    })

    it('passes with only vote lock address', async () => {
      const data = {
        ...validFormData(),
        governanceWalletAddress: undefined,
        governanceERC20address: undefined,
        governanceVoteLock: ADDR_1,
      }
      const result = await parse(data)
      expect(result.success).toBe(true)
    })

    it('fails with no governance option selected', async () => {
      const data = {
        ...validFormData(),
        governanceWalletAddress: undefined,
        governanceERC20address: undefined,
        governanceVoteLock: undefined,
      }
      expect(await hasError(data, 'governance')).toBe(true)
    })

    it('fails with two governance options', async () => {
      const data = {
        ...validFormData(),
        governanceWalletAddress: ADDR_1,
        governanceERC20address: ADDR_2,
        governanceVoteLock: undefined,
      }
      expect(await hasError(data, 'governance')).toBe(true)
    })

    it('fails with all three governance options', async () => {
      const data = {
        ...validFormData(),
        governanceWalletAddress: ADDR_1,
        governanceERC20address: ADDR_2,
        governanceVoteLock: ADDR_3,
      }
      expect(await hasError(data, 'governance')).toBe(true)
    })
  })

  // --- Revenue distribution sum ---

  describe('revenue distribution', () => {
    // --- Passing cases ---

    it('all to governance + platform: 50 + 50 = 100', async () => {
      const result = await parse(validFormData())
      expect(result.success).toBe(true)
    })

    it('governance + deployer split: 25 + 25 + 50 = 100', async () => {
      const data = {
        ...validFormData(),
        governanceShare: 25,
        deployerShare: 25,
      }
      expect((await parse(data)).success).toBe(true)
    })

    it('one additional recipient: 30 + 10 + 10 + 50 = 100', async () => {
      const data = {
        ...validFormData(),
        governanceShare: 30,
        deployerShare: 10,
        additionalRevenueRecipients: [{ address: ADDR_2, share: 10 }],
      }
      expect((await parse(data)).success).toBe(true)
    })

    it('many additional recipients with decimals summing correctly', async () => {
      // governance(20) + deployer(5.5) + r1(8.25) + r2(8.25) + r3(8) + platform(50) = 100
      const data = {
        ...validFormData(),
        governanceShare: 20,
        deployerShare: 5.5,
        additionalRevenueRecipients: [
          { address: ADDR_2, share: 8.25 },
          { address: ADDR_3, share: 8.25 },
          { address: ADDR_4, share: 8 },
        ],
      }
      expect((await parse(data)).success).toBe(true)
    })

    // Three-way equal split with platform fee
    it('three-way split: 16.67 + 16.67 + 16.66 + 50 = 100', async () => {
      const data = {
        ...validFormData(),
        governanceShare: 16.67,
        deployerShare: 16.67,
        additionalRevenueRecipients: [{ address: ADDR_2, share: 16.66 }],
      }
      expect((await parse(data)).success).toBe(true)
    })

    // Floating point stress: values that don't represent cleanly in binary
    it('decimal precision: 12.55 + 12.55 + 24.9 + 50 = 100', async () => {
      const data = {
        ...validFormData(),
        governanceShare: 12.55,
        deployerShare: 12.55,
        additionalRevenueRecipients: [{ address: ADDR_2, share: 24.9 }],
      }
      expect((await parse(data)).success).toBe(true)
    })

    // BSC: different platform fee (33%)
    it('BSC platform fee: 44.5 + 22.5 + 33 = 100', async () => {
      const data = {
        ...validFormData(),
        chain: 56,
        governanceShare: 44.5,
        deployerShare: 22.5,
        fixedPlatformFee: 33,
      }
      expect((await parse(data)).success).toBe(true)
    })

    // All revenue to deployer (no governance)
    it('all to deployer: 0 + 50 + 0 + 50 = 100', async () => {
      const data = {
        ...validFormData(),
        governanceShare: 0,
        deployerShare: 50,
      }
      expect((await parse(data)).success).toBe(true)
    })

    // --- Failure cases ---

    it('fails when total is below 100% with "missing" message', async () => {
      const data = {
        ...validFormData(),
        governanceShare: 30,
        deployerShare: 0,
      }
      // 30 + 0 + 50 = 80 → 20% missing
      const errors = await getErrors(data)
      const revError = errors.find((e) => e.path === 'revenue-distribution')
      expect(revError).toBeDefined()
      expect(revError!.message).toContain('20% missing')
    })

    it('fails when total exceeds 100% with "excess" message', async () => {
      const data = {
        ...validFormData(),
        governanceShare: 60,
        deployerShare: 10,
      }
      // 60 + 10 + 50 = 120 → 20% excess
      const errors = await getErrors(data)
      const revError = errors.find((e) => e.path === 'revenue-distribution')
      expect(revError).toBeDefined()
      expect(revError!.message).toContain('20% excess')
    })

    // User off by 0.01% - real scenario when manually adjusting
    it('fails at 99.99%: 49.99 + 0 + 50 (0.01% missing)', async () => {
      const data = {
        ...validFormData(),
        governanceShare: 49.99,
        deployerShare: 0,
      }
      const errors = await getErrors(data)
      const revError = errors.find((e) => e.path === 'revenue-distribution')
      expect(revError).toBeDefined()
      expect(revError!.message).toContain('0.01% missing')
    })

    it('fails at 100.01%: 50.01 + 0 + 50 (0.01% excess)', async () => {
      const data = {
        ...validFormData(),
        governanceShare: 50.01,
        deployerShare: 0,
      }
      const errors = await getErrors(data)
      const revError = errors.find((e) => e.path === 'revenue-distribution')
      expect(revError).toBeDefined()
      expect(revError!.message).toContain('0.01% excess')
    })

    // User forgot to adjust after adding a recipient
    it('fails when additional recipients push total over', async () => {
      const data = {
        ...validFormData(),
        governanceShare: 40,
        deployerShare: 5,
        additionalRevenueRecipients: [
          { address: ADDR_2, share: 3 },
          { address: ADDR_3, share: 3 },
        ],
      }
      // 40 + 5 + 3 + 3 + 50 = 101 → 1% excess
      const errors = await getErrors(data)
      const revError = errors.find((e) => e.path === 'revenue-distribution')
      expect(revError).toBeDefined()
      expect(revError!.message).toContain('excess')
    })
  })

  // --- Address deduplication ---

  describe('address deduplication', () => {
    it('rejects duplicate guardians (case-insensitive)', async () => {
      const data = {
        ...validFormData(),
        guardians: [ADDR_1, ADDR_1.replace('1111', '1111')], // same address
      }
      expect(await hasError(data, 'roles')).toBe(true)
    })

    it('rejects duplicate guardians with different casing', async () => {
      const data = {
        ...validFormData(),
        guardians: [ADDR_1.toLowerCase(), ADDR_1.toUpperCase().replace('0X', '0x')],
      }
      expect(await hasError(data, 'roles')).toBe(true)
    })

    it('rejects duplicate brand managers', async () => {
      const data = {
        ...validFormData(),
        brandManagers: [ADDR_1, ADDR_1],
      }
      expect(await hasError(data, 'roles')).toBe(true)
    })

    it('rejects duplicate auction launchers', async () => {
      const data = {
        ...validFormData(),
        auctionLaunchers: [ADDR_1, ADDR_1],
      }
      expect(await hasError(data, 'roles')).toBe(true)
    })

    it('allows different addresses in the same role', async () => {
      const data = {
        ...validFormData(),
        guardians: [ADDR_1, ADDR_2],
        brandManagers: [ADDR_1, ADDR_2],
        auctionLaunchers: [ADDR_1, ADDR_2],
      }
      expect(await hasError(data, 'roles')).toBe(false)
    })

    it('rejects duplicate additional revenue recipients (including governance)', async () => {
      const data = {
        ...validFormData(),
        governanceWalletAddress: ADDR_1,
        governanceShare: 40,
        deployerShare: 0,
        fixedPlatformFee: 50,
        additionalRevenueRecipients: [
          { address: ADDR_1, share: 10 }, // same as governance wallet
        ],
      }
      expect(await hasError(data, 'revenue-distribution')).toBe(true)
    })
  })

  // --- Boundary validations ---

  describe('boundary values', () => {
    it('rejects initialValue of 0 (must be positive)', async () => {
      expect(await hasError({ ...validFormData(), initialValue: 0 }, 'initialValue')).toBe(true)
    })

    it('rejects negative initialValue', async () => {
      expect(await hasError({ ...validFormData(), initialValue: -1 }, 'initialValue')).toBe(true)
    })

    it('accepts auctionLength of 0', async () => {
      expect(await hasError({ ...validFormData(), auctionLength: 0 }, 'auctionLength')).toBe(false)
    })

    it('rejects negative auctionLength', async () => {
      expect(await hasError({ ...validFormData(), auctionLength: -1 }, 'auctionLength')).toBe(true)
    })

    it('rejects governanceShare with more than 2 decimal places', async () => {
      expect(
        await hasError({ ...validFormData(), governanceShare: 25.123, deployerShare: 24.877 }, 'governanceShare')
      ).toBe(true)
    })

    it('rejects deployerShare with more than 2 decimal places', async () => {
      expect(
        await hasError({ ...validFormData(), governanceShare: 25, deployerShare: 24.999 }, 'deployerShare')
      ).toBe(true)
    })

    it('accepts governanceShare with exactly 2 decimal places', async () => {
      const data = { ...validFormData(), governanceShare: 25.25, deployerShare: 24.75 }
      expect(await hasError(data, 'governanceShare')).toBe(false)
      expect(await hasError(data, 'deployerShare')).toBe(false)
    })
  })

  // --- Chain validation ---

  describe('chain', () => {
    it('accepts Mainnet', async () => {
      expect(await hasError({ ...validFormData(), chain: 1 }, 'chain')).toBe(false)
    })

    it('accepts Base', async () => {
      expect(await hasError({ ...validFormData(), chain: 8453 }, 'chain')).toBe(false)
    })

    it('accepts BSC', async () => {
      expect(await hasError({ ...validFormData(), chain: 56 }, 'chain')).toBe(false)
    })

    it('rejects Arbitrum', async () => {
      expect(await hasError({ ...validFormData(), chain: 42161 }, 'chain')).toBe(true)
    })

    it('rejects unknown chain', async () => {
      expect(await hasError({ ...validFormData(), chain: 999 }, 'chain')).toBe(true)
    })
  })
})
