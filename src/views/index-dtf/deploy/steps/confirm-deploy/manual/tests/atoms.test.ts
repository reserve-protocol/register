import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Provider, useAtomValue, useSetAtom } from 'jotai'
import { atom } from 'jotai'
import { parseUnits } from 'viem'
import { createElement, ReactNode } from 'react'

// --- Mocks ---

vi.mock('@/state/atoms', () => ({
  chainIdAtom: atom(1),
  walletAtom: atom(null),
  balancesAtom: atom({}),
}))

vi.mock('@/utils/addresses', () => ({
  INDEX_DEPLOYER_ADDRESS: {
    1: '0xBE3B47587cEeff7D48008A0114f51cD571beC63A',
    8453: '0xA203AA351723cf943f91684e9F5eFcA7175Ae7EA',
  },
}))

vi.mock('@/utils/chains', () => ({
  ChainId: { Mainnet: 1, Base: 8453, BSC: 56, Arbitrum: 42161 },
}))

vi.mock('@/hooks/use-batch-approval', () => ({}))

// --- Imports under test ---

import {
  assetDistributionAtom,
  basketRequiredAmountsAtom,
  hasAssetsAllowanceAtom,
  tokensNeedingApprovalForDeployAtom,
  formattedAssetsAllowanceAtom,
  initialTokensAtom,
  assetsAllowanceAtom,
} from '../atoms'
import { basketAtom } from '../../../../atoms'
import { indexDeployFormDataAtom } from '../../atoms'
import { Token } from '@/types'

// --- Helpers ---

const createWrapper = () => {
  return ({ children }: { children: ReactNode }) =>
    createElement(Provider, null, children)
}

const ADDR_A = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' as const
const ADDR_B = '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB' as const
const ADDR_C = '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC' as const

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
    mandate: '',
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
    ...overrides,
  }) as any

// --- Tests ---

describe('assetDistributionAtom', () => {
  it('returns empty object when no form data is set', () => {
    const wrapper = createWrapper()

    const useTest = () => ({
      value: useAtomValue(assetDistributionAtom),
    })

    const { result } = renderHook(() => useTest(), { wrapper })
    expect(result.current.value).toEqual({})
  })

  it('maps tokensDistribution to { address: percentage } record', () => {
    const wrapper = createWrapper()

    const useTest = () => {
      const setFormData = useSetAtom(indexDeployFormDataAtom)
      const value = useAtomValue(assetDistributionAtom)
      return { setFormData, value }
    }

    const { result } = renderHook(() => useTest(), { wrapper })

    act(() => {
      result.current.setFormData(
        createFormData({
          tokensDistribution: [
            { address: ADDR_A, percentage: 60 },
            { address: ADDR_B, percentage: 40 },
          ],
        })
      )
    })

    expect(result.current.value).toEqual({
      [ADDR_A]: 60,
      [ADDR_B]: 40,
    })
  })

  it('handles single token distribution', () => {
    const wrapper = createWrapper()

    const useTest = () => {
      const setFormData = useSetAtom(indexDeployFormDataAtom)
      const value = useAtomValue(assetDistributionAtom)
      return { setFormData, value }
    }

    const { result } = renderHook(() => useTest(), { wrapper })

    act(() => {
      result.current.setFormData(
        createFormData({
          tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
        })
      )
    })

    expect(result.current.value).toEqual({ [ADDR_A]: 100 })
  })
})

describe('basketRequiredAmountsAtom', () => {
  it('calculates basic required amounts (initialTokens=1, initialValue=1, price=1)', () => {
    const wrapper = createWrapper()

    const useTest = () => {
      const setFormData = useSetAtom(indexDeployFormDataAtom)
      const setBasket = useSetAtom(basketAtom)
      const value = useAtomValue(basketRequiredAmountsAtom)
      return { setFormData, setBasket, value }
    }

    const { result } = renderHook(() => useTest(), { wrapper })

    act(() => {
      result.current.setBasket([
        createToken(ADDR_A, { price: 1 }),
        createToken(ADDR_B, { price: 1 }),
      ])
      result.current.setFormData(
        createFormData({
          initialValue: 1,
          tokensDistribution: [
            { address: ADDR_A, percentage: 50 },
            { address: ADDR_B, percentage: 50 },
          ],
        })
      )
    })

    // Formula: (1 * 1 * 50) / 100 / 1 = 0.5
    expect(result.current.value[ADDR_A]).toBe(0.5)
    expect(result.current.value[ADDR_B]).toBe(0.5)
  })

  it('accounts for token price in calculation', () => {
    const wrapper = createWrapper()

    const useTest = () => {
      const setFormData = useSetAtom(indexDeployFormDataAtom)
      const setBasket = useSetAtom(basketAtom)
      const value = useAtomValue(basketRequiredAmountsAtom)
      return { setFormData, setBasket, value }
    }

    const { result } = renderHook(() => useTest(), { wrapper })

    act(() => {
      result.current.setBasket([
        createToken(ADDR_A, { price: 2 }),
        createToken(ADDR_B, { price: 0.5 }),
      ])
      result.current.setFormData(
        createFormData({
          initialValue: 1,
          tokensDistribution: [
            { address: ADDR_A, percentage: 50 },
            { address: ADDR_B, percentage: 50 },
          ],
        })
      )
    })

    // Token A: (1 * 1 * 50) / 100 / 2 = 0.25
    // Token B: (1 * 1 * 50) / 100 / 0.5 = 1
    expect(result.current.value[ADDR_A]).toBe(0.25)
    expect(result.current.value[ADDR_B]).toBe(1)
  })

  it('scales with initialTokens multiplier', () => {
    const wrapper = createWrapper()

    const useTest = () => {
      const setFormData = useSetAtom(indexDeployFormDataAtom)
      const setBasket = useSetAtom(basketAtom)
      const setInitialTokens = useSetAtom(initialTokensAtom)
      const value = useAtomValue(basketRequiredAmountsAtom)
      return { setFormData, setBasket, setInitialTokens, value }
    }

    const { result } = renderHook(() => useTest(), { wrapper })

    act(() => {
      result.current.setBasket([createToken(ADDR_A, { price: 1 })])
      result.current.setFormData(
        createFormData({
          initialValue: 1,
          tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
        })
      )
      result.current.setInitialTokens('10')
    })

    // (10 * 1 * 100) / 100 / 1 = 10
    expect(result.current.value[ADDR_A]).toBe(10)
  })

  it('scales with initialValue', () => {
    const wrapper = createWrapper()

    const useTest = () => {
      const setFormData = useSetAtom(indexDeployFormDataAtom)
      const setBasket = useSetAtom(basketAtom)
      const value = useAtomValue(basketRequiredAmountsAtom)
      return { setFormData, setBasket, value }
    }

    const { result } = renderHook(() => useTest(), { wrapper })

    act(() => {
      result.current.setBasket([createToken(ADDR_A, { price: 1 })])
      result.current.setFormData(
        createFormData({
          initialValue: 100,
          tokensDistribution: [{ address: ADDR_A, percentage: 50 }],
        })
      )
    })

    // (1 * 100 * 50) / 100 / 1 = 50
    expect(result.current.value[ADDR_A]).toBe(50)
  })

  it('defaults price to 1 when token has no price', () => {
    const wrapper = createWrapper()

    const useTest = () => {
      const setFormData = useSetAtom(indexDeployFormDataAtom)
      const setBasket = useSetAtom(basketAtom)
      const value = useAtomValue(basketRequiredAmountsAtom)
      return { setFormData, setBasket, value }
    }

    const { result } = renderHook(() => useTest(), { wrapper })

    act(() => {
      // Token without price field
      result.current.setBasket([createToken(ADDR_A, { price: undefined })])
      result.current.setFormData(
        createFormData({
          initialValue: 1,
          tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
        })
      )
    })

    // Price defaults to 1: (1 * 1 * 100) / 100 / 1 = 1
    expect(result.current.value[ADDR_A]).toBe(1)
  })

  it('defaults initialTokens to 1 when empty string', () => {
    const wrapper = createWrapper()

    const useTest = () => {
      const setFormData = useSetAtom(indexDeployFormDataAtom)
      const setBasket = useSetAtom(basketAtom)
      const setInitialTokens = useSetAtom(initialTokensAtom)
      const value = useAtomValue(basketRequiredAmountsAtom)
      return { setFormData, setBasket, setInitialTokens, value }
    }

    const { result } = renderHook(() => useTest(), { wrapper })

    act(() => {
      result.current.setBasket([createToken(ADDR_A, { price: 1 })])
      result.current.setFormData(
        createFormData({
          initialValue: 1,
          tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
        })
      )
      result.current.setInitialTokens('')
    })

    // Number('') || 1 = 1, so (1 * 1 * 100) / 100 / 1 = 1
    expect(result.current.value[ADDR_A]).toBe(1)
  })

  it('falls back to price=1 when token price is 0', () => {
    const wrapper = createWrapper()

    const useTest = () => {
      const setFormData = useSetAtom(indexDeployFormDataAtom)
      const setBasket = useSetAtom(basketAtom)
      const value = useAtomValue(basketRequiredAmountsAtom)
      return { setFormData, setBasket, value }
    }

    const { result } = renderHook(() => useTest(), { wrapper })

    act(() => {
      // price: 0 → falls back to || 1
      result.current.setBasket([createToken(ADDR_A, { price: 0 })])
      result.current.setFormData(
        createFormData({
          initialValue: 1,
          tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
        })
      )
    })

    // price 0 || 1 = 1: (1 * 1 * 100) / 100 / 1 = 1
    expect(result.current.value[ADDR_A]).toBe(1)
  })
})

describe('hasAssetsAllowanceAtom', () => {
  const useTestHasAllowance = () => {
    const setFormData = useSetAtom(indexDeployFormDataAtom)
    const setBasket = useSetAtom(basketAtom)
    const setInitialTokens = useSetAtom(initialTokensAtom)
    const setAssetsAllowance = useSetAtom(assetsAllowanceAtom)
    const hasAllowance = useAtomValue(hasAssetsAllowanceAtom)
    return {
      setFormData,
      setBasket,
      setInitialTokens,
      setAssetsAllowance,
      hasAllowance,
    }
  }

  it('returns false when initialTokens is empty string', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestHasAllowance(), { wrapper })

    act(() => {
      result.current.setInitialTokens('')
    })

    expect(result.current.hasAllowance).toBe(false)
  })

  it('returns false when initialTokens is 0', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestHasAllowance(), { wrapper })

    act(() => {
      result.current.setInitialTokens('0')
    })

    expect(result.current.hasAllowance).toBe(false)
  })

  it('returns false when initialTokens is NaN', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestHasAllowance(), { wrapper })

    act(() => {
      result.current.setInitialTokens('abc')
    })

    expect(result.current.hasAllowance).toBe(false)
  })

  it('returns false when allowance is insufficient', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestHasAllowance(), { wrapper })

    act(() => {
      result.current.setBasket([createToken(ADDR_A, { price: 1 })])
      result.current.setFormData(
        createFormData({
          initialValue: 1,
          tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
        })
      )
      result.current.setInitialTokens('1')
      // Required: (1 * 1 * 100) / 100 / 1 = 1.0
      // Allowance: 0.5 (insufficient)
      result.current.setAssetsAllowance({
        [ADDR_A]: parseUnits('0.5', 18),
      })
    })

    expect(result.current.hasAllowance).toBe(false)
  })

  it('returns true when allowance equals required amount', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestHasAllowance(), { wrapper })

    act(() => {
      result.current.setBasket([createToken(ADDR_A, { price: 1 })])
      result.current.setFormData(
        createFormData({
          initialValue: 1,
          tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
        })
      )
      result.current.setInitialTokens('1')
      // Required: 1.0, allowance: 1.0
      result.current.setAssetsAllowance({
        [ADDR_A]: parseUnits('1', 18),
      })
    })

    expect(result.current.hasAllowance).toBe(true)
  })

  it('returns true when allowance exceeds required amount', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestHasAllowance(), { wrapper })

    act(() => {
      result.current.setBasket([createToken(ADDR_A, { price: 1 })])
      result.current.setFormData(
        createFormData({
          initialValue: 1,
          tokensDistribution: [{ address: ADDR_A, percentage: 100 }],
        })
      )
      result.current.setInitialTokens('1')
      result.current.setAssetsAllowance({
        [ADDR_A]: parseUnits('100', 18),
      })
    })

    expect(result.current.hasAllowance).toBe(true)
  })

  it('returns false when one token has insufficient allowance (multi-token)', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestHasAllowance(), { wrapper })

    act(() => {
      result.current.setBasket([
        createToken(ADDR_A, { price: 1 }),
        createToken(ADDR_B, { price: 1 }),
      ])
      result.current.setFormData(
        createFormData({
          initialValue: 1,
          tokensDistribution: [
            { address: ADDR_A, percentage: 50 },
            { address: ADDR_B, percentage: 50 },
          ],
        })
      )
      result.current.setInitialTokens('1')
      // Required: 0.5 each. A has enough, B does not.
      result.current.setAssetsAllowance({
        [ADDR_A]: parseUnits('1', 18),
        [ADDR_B]: parseUnits('0.1', 18),
      })
    })

    expect(result.current.hasAllowance).toBe(false)
  })
})

describe('tokensNeedingApprovalForDeployAtom', () => {
  const useTestNeedingApproval = () => {
    const setFormData = useSetAtom(indexDeployFormDataAtom)
    const setBasket = useSetAtom(basketAtom)
    const setAssetsAllowance = useSetAtom(assetsAllowanceAtom)
    const tokensNeedingApproval = useAtomValue(
      tokensNeedingApprovalForDeployAtom
    )
    return { setFormData, setBasket, setAssetsAllowance, tokensNeedingApproval }
  }

  it('returns all tokens when no allowances are set', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestNeedingApproval(), { wrapper })

    act(() => {
      result.current.setBasket([
        createToken(ADDR_A, { price: 1 }),
        createToken(ADDR_B, { price: 1 }),
      ])
      result.current.setFormData(
        createFormData({
          initialValue: 1,
          tokensDistribution: [
            { address: ADDR_A, percentage: 50 },
            { address: ADDR_B, percentage: 50 },
          ],
        })
      )
      result.current.setAssetsAllowance({})
    })

    expect(result.current.tokensNeedingApproval).toHaveLength(2)
  })

  it('returns empty array when all tokens have sufficient allowance', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestNeedingApproval(), { wrapper })

    act(() => {
      result.current.setBasket([
        createToken(ADDR_A, { price: 1 }),
        createToken(ADDR_B, { price: 1 }),
      ])
      result.current.setFormData(
        createFormData({
          initialValue: 1,
          tokensDistribution: [
            { address: ADDR_A, percentage: 50 },
            { address: ADDR_B, percentage: 50 },
          ],
        })
      )
      // Required: 0.5 each
      result.current.setAssetsAllowance({
        [ADDR_A]: parseUnits('10', 18),
        [ADDR_B]: parseUnits('10', 18),
      })
    })

    expect(result.current.tokensNeedingApproval).toHaveLength(0)
  })

  it('returns only tokens with insufficient allowance', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestNeedingApproval(), { wrapper })

    act(() => {
      result.current.setBasket([
        createToken(ADDR_A, { price: 1, symbol: 'AAA' }),
        createToken(ADDR_B, { price: 1, symbol: 'BBB' }),
      ])
      result.current.setFormData(
        createFormData({
          initialValue: 1,
          tokensDistribution: [
            { address: ADDR_A, percentage: 50 },
            { address: ADDR_B, percentage: 50 },
          ],
        })
      )
      // Required: 0.5 each. A has enough, B does not.
      result.current.setAssetsAllowance({
        [ADDR_A]: parseUnits('10', 18),
        [ADDR_B]: parseUnits('0.1', 18),
      })
    })

    expect(result.current.tokensNeedingApproval).toHaveLength(1)
    expect(result.current.tokensNeedingApproval[0].address).toBe(ADDR_B)
  })
})

describe('formattedAssetsAllowanceAtom', () => {
  const useTestFormattedAllowance = () => {
    const setBasket = useSetAtom(basketAtom)
    const setAssetsAllowance = useSetAtom(assetsAllowanceAtom)
    const formatted = useAtomValue(formattedAssetsAllowanceAtom)
    return { setBasket, setAssetsAllowance, formatted }
  }

  it('converts bigint allowances to formatted numbers (18 decimals)', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestFormattedAllowance(), {
      wrapper,
    })

    act(() => {
      result.current.setBasket([createToken(ADDR_A, { decimals: 18 })])
      result.current.setAssetsAllowance({
        [ADDR_A]: parseUnits('123.456', 18),
      })
    })

    expect(result.current.formatted[ADDR_A]).toBeCloseTo(123.456, 5)
  })

  it('converts bigint allowances to formatted numbers (6 decimals)', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestFormattedAllowance(), {
      wrapper,
    })

    act(() => {
      result.current.setBasket([createToken(ADDR_A, { decimals: 6 })])
      result.current.setAssetsAllowance({
        [ADDR_A]: parseUnits('1000', 6),
      })
    })

    expect(result.current.formatted[ADDR_A]).toBe(1000)
  })

  it('defaults to 0 when allowance is not set for a basket token', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestFormattedAllowance(), {
      wrapper,
    })

    act(() => {
      result.current.setBasket([createToken(ADDR_A, { decimals: 18 })])
      result.current.setAssetsAllowance({})
    })

    expect(result.current.formatted[ADDR_A]).toBe(0)
  })

  it('handles multiple tokens with different decimals', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestFormattedAllowance(), {
      wrapper,
    })

    act(() => {
      result.current.setBasket([
        createToken(ADDR_A, { decimals: 18 }),
        createToken(ADDR_B, { decimals: 6 }),
      ])
      result.current.setAssetsAllowance({
        [ADDR_A]: parseUnits('5', 18),
        [ADDR_B]: parseUnits('100', 6),
      })
    })

    expect(result.current.formatted[ADDR_A]).toBe(5)
    expect(result.current.formatted[ADDR_B]).toBe(100)
  })
})
