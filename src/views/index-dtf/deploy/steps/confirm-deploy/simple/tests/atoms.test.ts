import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Provider, useAtomValue, useSetAtom } from 'jotai'
import { parseEther, parseUnits } from 'viem'
import { createElement, ReactNode } from 'react'

// --- Hoisted constants & atoms (available before vi.mock factories run) ---

const {
  WALLET,
  ADDR_A,
  ADDR_B,
  OWNER,
  ST_TOKEN,
  GUARDIAN,
  BRAND_MGR,
  AUCTION_LAUNCHER,
  USDC_TOKEN,
  walletAtom,
  chainIdAtom,
  balancesAtom,
  mockRevenueDistribution,
} = vi.hoisted(() => {
  // NOTE: We must import jotai and viem inside vi.hoisted since
  // top-level imports are not available here.
  const { atom } = require('jotai')
  const { parseEther } = require('viem')

  const WALLET = '0x1111111111111111111111111111111111111111' as const
  const ADDR_A = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' as const
  const ADDR_B = '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB' as const
  const OWNER = '0x2222222222222222222222222222222222222222' as const
  const ST_TOKEN = '0x3333333333333333333333333333333333333333' as const
  const GUARDIAN = '0x4444444444444444444444444444444444444444' as const
  const BRAND_MGR = '0x5555555555555555555555555555555555555555' as const
  const AUCTION_LAUNCHER =
    '0x6666666666666666666666666666666666666666' as const

  const USDC_TOKEN = {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  }

  return {
    WALLET,
    ADDR_A,
    ADDR_B,
    OWNER,
    ST_TOKEN,
    GUARDIAN,
    BRAND_MGR,
    AUCTION_LAUNCHER,
    USDC_TOKEN,
    walletAtom: atom(WALLET),
    chainIdAtom: atom(1),
    balancesAtom: atom({}),
    mockRevenueDistribution: [
      { recipient: WALLET, portion: parseEther('1') },
    ],
  }
})

// --- Mocks ---

vi.mock('@/state/atoms', () => ({
  chainIdAtom,
  walletAtom,
  balancesAtom,
}))

vi.mock('@/utils/chains', () => ({
  ChainId: { Mainnet: 1, Base: 8453, BSC: 56, Arbitrum: 42161 },
}))

vi.mock('@/utils/addresses', () => ({
  INDEX_DEPLOYER_ADDRESS: {
    1: '0xBE3B47587cEeff7D48008A0114f51cD571beC63A',
    8453: '0xA203AA351723cf943f91684e9F5eFcA7175Ae7EA',
  },
}))

vi.mock('@/hooks/use-batch-approval', () => ({}))

vi.mock(
  '@/views/yield-dtf/issuance/components/zapV2/constants',
  () => ({
    reducedZappableTokens: {
      1: [USDC_TOKEN],
      8453: [USDC_TOKEN],
    },
  })
)

vi.mock('@/views/index-dtf/deploy/utils', () => ({
  calculateRevenueDistribution: () => mockRevenueDistribution,
}))

vi.mock('@reserve-protocol/dtf-rebalance-lib', () => ({
  PriceControl: { NONE: 0, PARTIAL: 1, ATOMIC_SWAP: 2 },
}))

// --- Imports under test ---

import {
  zapDeployPayloadAtom,
  inputTokenAtom,
  inputAmountAtom,
  slippageAtom,
} from '../atoms'
import { basketAtom, daoTokenAddressAtom } from '../../../../atoms'
import { indexDeployFormDataAtom } from '../../atoms'
import { initialTokensAtom } from '../../manual/atoms'
import { Token } from '@/types'
import {
  ZapDeployBody,
  ZapDeployUngovernedBody,
} from '@/views/yield-dtf/issuance/components/zapV2/api/types'

// --- Helpers ---

const createWrapper = () => {
  return ({ children }: { children: ReactNode }) =>
    createElement(Provider, null, children)
}

const createToken = (
  address: string,
  overrides: Partial<Token> = {}
): Token => ({
  address: address as `0x${string}`,
  symbol: 'TKN',
  name: 'Token',
  decimals: 18,
  price: 1,
  ...overrides,
})

const createFormData = (overrides: Record<string, unknown> = {}) =>
  ({
    tokenName: 'Test DTF',
    symbol: 'TDTF',
    mandate: 'Test mandate',
    chain: 1,
    initialValue: 1,
    inputType: 'share',
    tokensDistribution: [
      { address: ADDR_A, percentage: 50 },
      { address: ADDR_B, percentage: 50 },
    ],
    folioFee: 1,
    mintFee: 0.5,
    governanceShare: 50,
    deployerShare: 0,
    fixedPlatformFee: 50,
    auctionLength: 30,
    weightControl: false,
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
    governanceWalletAddress: undefined,
    ...overrides,
  }) as any

/**
 * Sets up the common state needed for most zap deploy tests.
 * Returns setters and the payload atom value.
 */
const useTestZapPayload = () => {
  const setFormData = useSetAtom(indexDeployFormDataAtom)
  const setBasket = useSetAtom(basketAtom)
  const setDaoToken = useSetAtom(daoTokenAddressAtom)
  const setInputAmount = useSetAtom(inputAmountAtom)
  const setInputToken = useSetAtom(inputTokenAtom)
  const setSlippage = useSetAtom(slippageAtom)
  const payload = useAtomValue(zapDeployPayloadAtom)
  return {
    setFormData,
    setBasket,
    setDaoToken,
    setInputAmount,
    setInputToken,
    setSlippage,
    payload,
  }
}

// --- Tests ---

describe('zapDeployPayloadAtom', () => {
  describe('guard clauses', () => {
    it('returns undefined when formData is missing', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setInputAmount('100')
        // formData not set -> undefined
      })

      expect(result.current.payload).toBeUndefined()
    })

    it('returns a payload when wallet is present', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([createToken(ADDR_A, { price: 1 })])
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
          })
        )
        result.current.setInputAmount('100')
      })

      // walletAtom is WALLET in mock → payload should exist
      expect(result.current.payload).toBeDefined()
    })

    it('returns undefined when amountIn is empty string', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([createToken(ADDR_A, { price: 1 })])
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
          })
        )
        result.current.setInputAmount('')
      })

      expect(result.current.payload).toBeUndefined()
    })

    it('returns undefined when amountIn is "0"', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([createToken(ADDR_A, { price: 1 })])
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
          })
        )
        result.current.setInputAmount('0')
      })

      expect(result.current.payload).toBeUndefined()
    })
  })

  describe('ungoverned DTF payload', () => {
    const setupUngoverned = () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([
          createToken(ADDR_A, { price: 1, decimals: 18 }),
          createToken(ADDR_B, { price: 2, decimals: 18 }),
        ])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            governanceWalletAddress: OWNER,
            tokensDistribution: [
              { address: ADDR_A, percentage: 50 },
              { address: ADDR_B, percentage: 50 },
            ],
          })
        )
        result.current.setInputAmount('100')
      })

      return result
    }

    it('has owner field set to governanceWalletAddress', () => {
      const result = setupUngoverned()
      const payload = result.current.payload as ZapDeployUngovernedBody
      expect(payload.owner).toBe(OWNER)
    })

    it('does NOT have stToken, ownerGovParams, or tradingGovParams', () => {
      const result = setupUngoverned()
      const payload = result.current.payload as any
      expect(payload.stToken).toBeUndefined()
      expect(payload.ownerGovParams).toBeUndefined()
      expect(payload.tradingGovParams).toBeUndefined()
    })

    it('has correct basicDetails name and symbol', () => {
      const result = setupUngoverned()
      const payload = result.current.payload as ZapDeployUngovernedBody
      expect(payload.basicDetails.name).toBe('Test DTF')
      expect(payload.basicDetails.symbol).toBe('TDTF')
    })

    it('has basket asset addresses in basicDetails', () => {
      const result = setupUngoverned()
      const payload = result.current.payload as ZapDeployUngovernedBody
      expect(payload.basicDetails.assets).toEqual([ADDR_A, ADDR_B])
    })

    it('returns undefined when governanceWalletAddress is missing for ungoverned', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([createToken(ADDR_A, { price: 1 })])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            governanceWalletAddress: undefined,
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
          })
        )
        result.current.setInputAmount('100')
      })

      expect(result.current.payload).toBeUndefined()
    })
  })

  describe('governed DTF payload', () => {
    const setupGoverned = () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([
          createToken(ADDR_A, { price: 1, decimals: 18 }),
        ])
        result.current.setDaoToken(ST_TOKEN)
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            // Owner governance (days)
            governanceVotingDelay: 2,
            governanceVotingPeriod: 3,
            governanceVotingThreshold: 5,
            governanceVotingQuorum: 10,
            governanceExecutionDelay: 1,
            // Trading governance (hours)
            basketVotingDelay: 24,
            basketVotingPeriod: 48,
            basketVotingThreshold: 1,
            basketVotingQuorum: 4,
            basketExecutionDelay: 12,
            guardians: [GUARDIAN],
          })
        )
        result.current.setInputAmount('100')
      })

      return result
    }

    it('has stToken field', () => {
      const result = setupGoverned()
      const payload = result.current.payload as ZapDeployBody
      expect(payload.stToken).toBe(ST_TOKEN)
    })

    it('does NOT have owner field', () => {
      const result = setupGoverned()
      const payload = result.current.payload as any
      expect(payload.owner).toBeUndefined()
    })

    it('converts ownerGovParams votingDelay from days to seconds', () => {
      const result = setupGoverned()
      const payload = result.current.payload as ZapDeployBody
      // 2 days * 86400 = 172800 seconds
      expect(payload.ownerGovParams.votingDelay).toBe(
        Math.floor(2 * 86400).toString()
      )
    })

    it('converts ownerGovParams votingPeriod from days to seconds', () => {
      const result = setupGoverned()
      const payload = result.current.payload as ZapDeployBody
      // 3 days * 86400 = 259200 seconds
      expect(payload.ownerGovParams.votingPeriod).toBe(
        Math.floor(3 * 86400).toString()
      )
    })

    it('converts ownerGovParams timelockDelay from days to seconds', () => {
      const result = setupGoverned()
      const payload = result.current.payload as ZapDeployBody
      // 1 day * 86400 = 86400 seconds
      expect(payload.ownerGovParams.timelockDelay).toBe(
        Math.floor(1 * 86400).toString()
      )
    })

    it('converts ownerGovParams proposalThreshold (percentage to parseEther)', () => {
      const result = setupGoverned()
      const payload = result.current.payload as ZapDeployBody
      // 5% / 100 = 0.05, parseEther('0.05')
      expect(payload.ownerGovParams.proposalThreshold).toBe(
        parseEther('0.05').toString()
      )
    })

    it('converts ownerGovParams quorumThreshold (percentage to parseEther)', () => {
      const result = setupGoverned()
      const payload = result.current.payload as ZapDeployBody
      // 10% / 100 = 0.1, parseEther('0.1')
      expect(payload.ownerGovParams.quorumThreshold).toBe(
        parseEther('0.1').toString()
      )
    })

    it('converts tradingGovParams votingDelay from hours to seconds', () => {
      const result = setupGoverned()
      const payload = result.current.payload as ZapDeployBody
      // 24 hours * 3600 = 86400 seconds
      expect(payload.tradingGovParams.votingDelay).toBe(
        Math.floor(24 * 3600).toString()
      )
    })

    it('converts tradingGovParams votingPeriod from hours to seconds', () => {
      const result = setupGoverned()
      const payload = result.current.payload as ZapDeployBody
      // 48 hours * 3600 = 172800 seconds
      expect(payload.tradingGovParams.votingPeriod).toBe(
        Math.floor(48 * 3600).toString()
      )
    })

    it('converts tradingGovParams timelockDelay from hours to seconds', () => {
      const result = setupGoverned()
      const payload = result.current.payload as ZapDeployBody
      // 12 hours * 3600 = 43200 seconds
      expect(payload.tradingGovParams.timelockDelay).toBe(
        Math.floor(12 * 3600).toString()
      )
    })

    it('converts tradingGovParams proposalThreshold (percentage to parseEther)', () => {
      const result = setupGoverned()
      const payload = result.current.payload as ZapDeployBody
      // 1% / 100 = 0.01, parseEther('0.01')
      expect(payload.tradingGovParams.proposalThreshold).toBe(
        parseEther('0.01').toString()
      )
    })

    it('converts tradingGovParams quorumThreshold (percentage to parseEther)', () => {
      const result = setupGoverned()
      const payload = result.current.payload as ZapDeployBody
      // 4% / 100 = 0.04, parseEther('0.04')
      expect(payload.tradingGovParams.quorumThreshold).toBe(
        parseEther('0.04').toString()
      )
    })

    it('includes guardians in both govParams', () => {
      const result = setupGoverned()
      const payload = result.current.payload as ZapDeployBody
      expect(payload.ownerGovParams.guardians).toEqual([GUARDIAN])
      expect(payload.tradingGovParams.guardians).toEqual([GUARDIAN])
    })
  })

  describe('shared payload fields', () => {
    const setupPayload = (overrides: Record<string, unknown> = {}) => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([
          createToken(ADDR_A, { price: 1, decimals: 18 }),
        ])
        result.current.setDaoToken(undefined) // ungoverned for simplicity
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
            ...overrides,
          })
        )
        result.current.setInputAmount('100')
      })

      return result
    }

    it('converts auctionLength from minutes to seconds', () => {
      const result = setupPayload({ auctionLength: 30 })
      const payload = result.current.payload!
      // 30 minutes * 60 = 1800 seconds
      expect(payload.additionalDetails.auctionLength).toBe('1800')
    })

    it('converts tvlFee from percentage to parseEther(fee/100)', () => {
      const result = setupPayload({ folioFee: 2 })
      const payload = result.current.payload!
      // 2% / 100 = 0.02, parseEther('0.02')
      expect(payload.additionalDetails.tvlFee).toBe(
        parseEther('0.02').toString()
      )
    })

    it('converts mintFee from percentage to parseEther(fee/100)', () => {
      const result = setupPayload({ mintFee: 0.5 })
      const payload = result.current.payload!
      // 0.5% / 100 = 0.005, parseEther('0.005')
      expect(payload.additionalDetails.mintFee).toBe(
        parseEther('0.005').toString()
      )
    })

    it('includes mandate in additionalDetails', () => {
      const result = setupPayload({ mandate: 'My mandate text' })
      const payload = result.current.payload!
      expect(payload.additionalDetails.mandate).toBe('My mandate text')
    })

    it('defaults mandate to empty string when undefined', () => {
      const result = setupPayload({ mandate: undefined })
      const payload = result.current.payload!
      expect(payload.additionalDetails.mandate).toBe('')
    })

    it('sets folioFlags.trustedFillerEnabled to true', () => {
      const result = setupPayload()
      const payload = result.current.payload!
      expect(payload.folioFlags.trustedFillerEnabled).toBe(true)
    })

    it('sets folioFlags.rebalanceControl.priceControl to PARTIAL (1)', () => {
      const result = setupPayload()
      const payload = result.current.payload!
      expect(payload.folioFlags.rebalanceControl.priceControl).toBe(1)
    })

    it('passes weightControl from form data (false)', () => {
      const result = setupPayload({ weightControl: false })
      const payload = result.current.payload!
      expect(payload.folioFlags.rebalanceControl.weightControl).toBe(false)
    })

    it('passes weightControl from form data (true)', () => {
      const result = setupPayload({ weightControl: true })
      const payload = result.current.payload!
      expect(payload.folioFlags.rebalanceControl.weightControl).toBe(true)
    })

    it('uses default slippage (1/100 = 0.01)', () => {
      const result = setupPayload()
      const payload = result.current.payload!
      expect(payload.slippage).toBe(0.01)
    })

    it('uses custom slippage value', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([
          createToken(ADDR_A, { price: 1, decimals: 18 }),
        ])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
          })
        )
        result.current.setInputAmount('100')
        result.current.setSlippage('200')
      })

      const payload = result.current.payload!
      // 1 / 200 = 0.005
      expect(payload.slippage).toBe(0.005)
    })

    it('sets signer to wallet address', () => {
      const result = setupPayload()
      const payload = result.current.payload!
      expect(payload.signer).toBe(WALLET)
    })

    it('uses default input token (USDC) when inputToken not set', () => {
      const result = setupPayload()
      const payload = result.current.payload!
      expect(payload.tokenIn).toBe(USDC_TOKEN.address)
    })

    it('converts amountIn using input token decimals', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([
          createToken(ADDR_A, { price: 1, decimals: 18 }),
        ])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
          })
        )
        // Default token is USDC (6 decimals)
        result.current.setInputAmount('100')
      })

      const payload = result.current.payload!
      // 100 USDC = 100 * 10^6
      expect(payload.amountIn).toBe(parseUnits('100', 6).toString())
    })

    it('includes feeRecipients from calculateRevenueDistribution', () => {
      const result = setupPayload()
      const payload = result.current.payload!
      expect(payload.additionalDetails.feeRecipients).toEqual([
        { recipient: WALLET, portion: parseEther('1').toString() },
      ])
    })

    it('computes basicDetails.amounts from basketRequiredAmountsAtom', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([
          createToken(ADDR_A, { price: 2, decimals: 18 }),
        ])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            initialValue: 1,
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
          })
        )
        result.current.setInputAmount('50')
      })

      const payload = result.current.payload!
      // basketRequiredAmounts: (1 * 1 * 100) / 100 / 2 = 0.5
      // parseUnits('0.5', 18) as string
      expect(payload.basicDetails.amounts[0]).toBe(
        parseUnits('0.5', 18).toString()
      )
    })
  })

  describe('roles filtering', () => {
    it('filters out empty strings from guardians', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([
          createToken(ADDR_A, { price: 1, decimals: 18 }),
        ])
        result.current.setDaoToken(ST_TOKEN)
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            guardians: [GUARDIAN, '', ''],
          })
        )
        result.current.setInputAmount('100')
      })

      const payload = result.current.payload as ZapDeployBody
      expect(payload.ownerGovParams.guardians).toEqual([GUARDIAN])
      expect(payload.tradingGovParams.guardians).toEqual([GUARDIAN])
    })

    it('filters out empty strings from brandManagers', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([
          createToken(ADDR_A, { price: 1, decimals: 18 }),
        ])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
            brandManagers: [BRAND_MGR, ''],
          })
        )
        result.current.setInputAmount('100')
      })

      const payload = result.current.payload as ZapDeployUngovernedBody
      expect(payload.brandManagers).toEqual([BRAND_MGR])
    })

    it('filters out empty strings from auctionLaunchers', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([
          createToken(ADDR_A, { price: 1, decimals: 18 }),
        ])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
            auctionLaunchers: [AUCTION_LAUNCHER, '', ''],
          })
        )
        result.current.setInputAmount('100')
      })

      const payload = result.current.payload as ZapDeployUngovernedBody
      expect(payload.auctionLaunchers).toEqual([AUCTION_LAUNCHER])
    })

    it('basketManagers is always empty array', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([
          createToken(ADDR_A, { price: 1, decimals: 18 }),
        ])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
          })
        )
        result.current.setInputAmount('100')
      })

      const payload = result.current.payload!
      expect(payload.basketManagers).toEqual([])
    })
  })

  describe('fee unit conversions', () => {
    it('handles zero fees', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([
          createToken(ADDR_A, { price: 1, decimals: 18 }),
        ])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
            folioFee: 0,
            mintFee: 0,
            auctionLength: 0,
          })
        )
        result.current.setInputAmount('100')
      })

      const payload = result.current.payload!
      expect(payload.additionalDetails.tvlFee).toBe(parseEther('0').toString())
      expect(payload.additionalDetails.mintFee).toBe(parseEther('0').toString())
      expect(payload.additionalDetails.auctionLength).toBe('0')
    })

    it('handles fractional auctionLength', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([
          createToken(ADDR_A, { price: 1, decimals: 18 }),
        ])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
            auctionLength: 1.5,
          })
        )
        result.current.setInputAmount('100')
      })

      const payload = result.current.payload!
      // 1.5 minutes * 60 = 90 seconds
      expect(payload.additionalDetails.auctionLength).toBe('90')
    })
  })

  describe('slippage edge cases', () => {
    it('sets slippage to undefined when slippage atom is empty string', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([createToken(ADDR_A, { price: 1, decimals: 18 })])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
          })
        )
        result.current.setInputAmount('100')
        result.current.setSlippage('')
      })

      // '' is falsy → slippage = undefined
      expect(result.current.payload!.slippage).toBeUndefined()
    })

    it('sets slippage to undefined when slippage atom is "0"', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([createToken(ADDR_A, { price: 1, decimals: 18 })])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
          })
        )
        result.current.setInputAmount('100')
        result.current.setSlippage('0')
      })

      // '0' is truthy but Number('0') is falsy → guard catches it
      expect(result.current.payload!.slippage).toBeUndefined()
    })
  })

  describe('custom input token', () => {
    it('uses custom inputToken address and decimals (18 decimals)', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      const WETH = createToken(
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 }
      )

      act(() => {
        result.current.setBasket([createToken(ADDR_A, { price: 1, decimals: 18 })])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
            governanceWalletAddress: OWNER,
          })
        )
        result.current.setInputToken(WETH)
        result.current.setInputAmount('2.5')
      })

      const payload = result.current.payload!
      expect(payload.tokenIn).toBe(WETH.address)
      // 2.5 with 18 decimals
      expect(payload.amountIn).toBe(parseUnits('2.5', 18).toString())
    })
  })

  describe('multi-token amounts ordering', () => {
    it('amounts array order matches assets array order', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestZapPayload(), { wrapper })

      act(() => {
        result.current.setBasket([
          createToken(ADDR_A, { price: 2, decimals: 18, symbol: 'WBTC' }),
          createToken(ADDR_B, { price: 0.5, decimals: 6, symbol: 'USDC' }),
        ])
        result.current.setDaoToken(undefined)
        result.current.setFormData(
          createFormData({
            initialValue: 1,
            tokensDistribution: [
              { address: ADDR_A, percentage: 60 },
              { address: ADDR_B, percentage: 40 },
            ],
            governanceWalletAddress: OWNER,
          })
        )
        result.current.setInputAmount('100')
      })

      const payload = result.current.payload!
      expect(payload.basicDetails.assets).toEqual([ADDR_A, ADDR_B])
      expect(payload.basicDetails.amounts).toHaveLength(2)

      // Compute expected through same float path as source:
      // basketRequiredAmounts: (initialValue * 1 * pct) / 100 / price
      const amtA = (1 * 1 * 60) / 100 / 2 // 0.3 (float)
      const amtB = (1 * 1 * 40) / 100 / 0.5 // 0.8 (float)
      expect(payload.basicDetails.amounts[0]).toBe(
        parseUnits(amtA.toFixed(18), 18).toString()
      )
      expect(payload.basicDetails.amounts[1]).toBe(
        parseUnits(amtB.toFixed(6), 6).toString()
      )
    })
  })
})
