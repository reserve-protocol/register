import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Provider, useAtomValue, useSetAtom } from 'jotai'
import { parseEther, parseUnits } from 'viem'
import { createElement, ReactNode } from 'react'

const {
  WALLET,
  ADDR_A,
  ADDR_B,
  OWNER,
  ST_TOKEN,
  JAR,
  GUARDIAN,
  USDC_TOKEN,
  walletAtom,
  chainIdAtom,
  balancesAtom,
} = vi.hoisted(() => {
  const { atom } = require('jotai')
  const WALLET = '0x1111111111111111111111111111111111111111' as const
  const USDC_TOKEN = {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  }
  return {
    WALLET,
    ADDR_A: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' as const,
    ADDR_B: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB' as const,
    OWNER: '0x2222222222222222222222222222222222222222' as const,
    ST_TOKEN: '0x3333333333333333333333333333333333333333' as const,
    JAR: '0x7777777777777777777777777777777777777777' as const,
    GUARDIAN: '0x4444444444444444444444444444444444444444' as const,
    USDC_TOKEN,
    walletAtom: atom(WALLET),
    chainIdAtom: atom(1),
    balancesAtom: atom({}),
  }
})

vi.mock('@/state/atoms', () => ({ chainIdAtom, walletAtom, balancesAtom }))
vi.mock('@/hooks/use-batch-approval', () => ({}))
vi.mock('@/views/yield-dtf/issuance/components/zapV2/constants', () => ({
  reducedZappableTokens: { 1: [USDC_TOKEN], 8453: [USDC_TOKEN] },
}))

import {
  zapDeployBuildErrorAtom,
  zapDeployPayloadAtom,
  inputTokenAtom,
  inputAmountAtom,
  slippageAtom,
} from '../atoms'
import { basketAtom, daoTokenAddressAtom } from '../../../../atoms'
import { governanceRecipientAtom, indexDeployFormDataAtom } from '../../atoms'
import {
  dtfDeployDefaultValues,
  type DeployInputs,
} from '../../../../form-fields'
import { Token } from '@/types'
import type {
  ZapDeployBody,
  ZapDeployUngovernedBody,
} from '@/views/yield-dtf/issuance/components/zapV2/api/types'

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(Provider, null, children)

const token = (address: string, overrides: Partial<Token> = {}): Token => ({
  address: address as `0x${string}`,
  symbol: 'TKN',
  name: 'Token',
  decimals: 18,
  price: 1,
  ...overrides,
})

const form = (patch: Partial<DeployInputs> = {}): DeployInputs => ({
  ...dtfDeployDefaultValues,
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
  fixedPlatformFee: 50,
  governanceShare: 50,
  deployerShare: 0,
  ...patch,
})

const useZapPayload = () => ({
  setForm: useSetAtom(indexDeployFormDataAtom),
  setBasket: useSetAtom(basketAtom),
  setStToken: useSetAtom(daoTokenAddressAtom),
  setRecipient: useSetAtom(governanceRecipientAtom),
  setAmount: useSetAtom(inputAmountAtom),
  setInputToken: useSetAtom(inputTokenAtom),
  setSlippage: useSetAtom(slippageAtom),
  payload: useAtomValue(zapDeployPayloadAtom),
  buildError: useAtomValue(zapDeployBuildErrorAtom),
})

const setup = (
  patch: Partial<DeployInputs> = {},
  {
    governed = false,
    jar = true,
    amount = '100',
  }: { governed?: boolean; jar?: boolean; amount?: string } = {}
) => {
  const { result } = renderHook(() => useZapPayload(), { wrapper })
  act(() => {
    result.current.setBasket([
      token(ADDR_A, { price: 1 }),
      token(ADDR_B, { price: 2 }),
    ])
    result.current.setStToken(governed ? ST_TOKEN : undefined)
    result.current.setRecipient(
      governed
        ? jar
          ? { stToken: ST_TOKEN, tokenJar: JAR }
          : { stToken: ST_TOKEN }
        : undefined
    )
    // The wallet option resets the governance share, so an ungoverned form gives it to the creator.
    result.current.setForm(
      form(
        governed
          ? patch
          : {
              governanceWalletAddress: OWNER,
              governanceShare: 0,
              deployerShare: 50,
              ...patch,
            }
      )
    )
    result.current.setAmount(amount)
  })
  return result
}

describe('zapDeployPayloadAtom', () => {
  describe('guards', () => {
    it('returns undefined without form data', () => {
      const { result } = renderHook(() => useZapPayload(), { wrapper })
      act(() => result.current.setAmount('100'))
      expect(result.current.payload).toBeUndefined()
    })

    it.each(['', '0'])('returns undefined for amount %j', (amount) => {
      expect(setup({}, { amount }).current.payload).toBeUndefined()
    })

    it('returns undefined for an ungoverned deploy without an owner', () => {
      expect(
        setup({ governanceWalletAddress: undefined }).current.payload
      ).toBeUndefined()
    })

    it('surfaces a body that cannot be built instead of quietly never quoting', () => {
      const result = setup({ governanceShare: 30, deployerShare: 10 }, { governed: true })
      expect(result.current.payload).toBeUndefined()
      expect(result.current.buildError).toMatch(/add up/i)
    })

    it('waits for the vault token jar before quoting a governed deploy', () => {
      expect(
        setup({}, { governed: true, jar: false }).current.payload
      ).toBeUndefined()
    })
  })

  describe('ungoverned body', () => {
    it('matches the zapper 6.0.0 ungoverned schema', () => {
      const payload = setup().current.payload as ZapDeployUngovernedBody
      expect(payload).toEqual({
        tokenIn: USDC_TOKEN.address,
        amountIn: parseUnits('100', 6).toString(),
        signer: WALLET,
        slippage: 0.01,
        owner: OWNER,
        basicDetails: {
          name: 'Test DTF',
          symbol: 'TDTF',
          assets: [ADDR_A, ADDR_B],
          amounts: [
            parseUnits('0.5', 18).toString(),
            parseUnits('0.25', 18).toString(),
          ],
        },
        additionalDetails: {
          maxAuctionLength: '1800',
          feeRecipients: [{ recipient: WALLET, portion: parseEther('1').toString() }],
          immutableFeeRecipients: [],
          tvlFee: parseEther('0.01').toString(),
          mintFee: parseEther('0.005').toString(),
          folioFeeForSelf: '0',
          mandate: 'Test mandate',
        },
        folioFlags: {
          trustedFillerEnabled: true,
          rebalanceControl: {
            weightControl: dtfDeployDefaultValues.weightControl,
            priceControl: 1,
          },
          bidsEnabled: dtfDeployDefaultValues.bidsEnabled,
        },
        basketManagers: [],
        auctionLaunchers: [],
        brandManagers: [],
      })
      expect(payload).not.toHaveProperty('stToken')
      expect(payload).not.toHaveProperty('govParams')
    })
  })

  describe('governed body', () => {
    it('sends one optimistic govParams block with every number as a decimal string', () => {
      const payload = setup(
        {
          guardians: [GUARDIAN, ''],
          optimisticActions: [],
          optimisticProposers: [],
        },
        { governed: true }
      ).current.payload as ZapDeployBody
      expect(payload.stToken).toBe(ST_TOKEN)
      expect(payload).not.toHaveProperty('owner')
      expect(payload).not.toHaveProperty('ownerGovParams')
      expect(payload.govParams).toEqual({
        optimisticParams: {
          vetoDelay: String(4 * 3600),
          vetoPeriod: String(20 * 3600),
          vetoThreshold: parseEther('0.01').toString(),
        },
        standardParams: {
          votingDelay: String(2 * 86400),
          votingPeriod: String(3 * 86400),
          voteExtension: String(2 * 86400),
          proposalThreshold: parseEther('0.0001').toString(),
          quorumNumerator: parseEther('0.1').toString(),
        },
        optimisticSelectors: [],
        optimisticProposers: [],
        additionalGuardians: [GUARDIAN],
        timelockDelay: String(2 * 86400),
        proposalThrottleCapacity: '3',
      })
    })

    it('routes the governance share to the token jar, never the vault', () => {
      const payload = setup({}, { governed: true }).current
        .payload as ZapDeployBody
      expect(payload.additionalDetails.feeRecipients).toEqual([
        { recipient: JAR, portion: parseEther('1').toString() },
      ])
    })

    it('sends the holder share as folioFeeForSelf and permanent recipients as the immutable table', () => {
      const payload = setup(
        {
          holderShare: 10,
          governanceShare: 30,
          permanentRevenueRecipients: [{ address: OWNER, share: 10 }],
        },
        { governed: true }
      ).current.payload as ZapDeployBody
      expect(payload.additionalDetails.folioFeeForSelf).toBe(
        parseEther('0.2').toString()
      )
      expect(payload.additionalDetails.feeRecipients).toEqual([
        { recipient: JAR, portion: parseEther('0.75').toString() },
      ])
      expect(payload.additionalDetails.immutableFeeRecipients).toEqual([
        { recipient: OWNER, portion: parseEther('0.25').toString() },
      ])
    })
  })

  describe('input token and slippage', () => {
    it.each([
      ['100', 0.01],
      ['1000', 0.001],
      ['', undefined],
      ['0', undefined],
    ])('slippage %j → %s', (slippage, expected) => {
      const result = setup()
      act(() => result.current.setSlippage(slippage))
      expect(result.current.payload?.slippage).toBe(expected)
    })

    it('uses a custom input token and its decimals', () => {
      const result = setup()
      const weth = token('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', {
        symbol: 'WETH',
      })
      act(() => {
        result.current.setInputToken(weth)
        result.current.setAmount('1.5')
      })
      expect(result.current.payload?.tokenIn).toBe(weth.address)
      expect(result.current.payload?.amountIn).toBe(
        parseEther('1.5').toString()
      )
    })
  })
})
