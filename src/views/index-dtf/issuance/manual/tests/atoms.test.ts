import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Provider, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { parseEther } from 'viem'
import { createElement, ReactNode } from 'react'

import {
  maxMintAmountAtom,
  assetDistributionAtom,
  balanceMapAtom,
  tokensNeedingApprovalAtom,
  allowanceMapAtom,
  assetAmountsMapAtom,
  amountAtom,
} from '../atoms'
import { indexDTFAtom, indexDTFBasketAtom } from '@/state/dtf/atoms'

// Wrapper component for Jotai Provider
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) =>
    createElement(Provider, null, children)
}

// Helper hook to set up test state
const useTestSetup = () => {
  const setIndexDTF = useSetAtom(indexDTFAtom)
  const setAssetDistribution = useSetAtom(assetDistributionAtom)
  const setBalanceMap = useSetAtom(balanceMapAtom)
  const setIndexDTFBasket = useSetAtom(indexDTFBasketAtom)
  const setAmount = useSetAtom(amountAtom)
  const setAllowanceMap = useSetAtom(allowanceMapAtom)
  const maxMintAmount = useAtomValue(maxMintAmountAtom)
  const tokensNeedingApproval = useAtomValue(tokensNeedingApprovalAtom)

  return {
    setIndexDTF,
    setAssetDistribution,
    setBalanceMap,
    setIndexDTFBasket,
    setAmount,
    setAllowanceMap,
    maxMintAmount,
    tokensNeedingApproval,
  }
}

// Minimal mock for indexDTF
const createMockIndexDTF = (overrides = {}) =>
  ({
    id: '0x123',
    ...overrides,
  }) as any

const createMockToken = (address: string) => ({
  address,
  symbol: 'TEST',
  name: 'Test Token',
  decimals: 18,
})

describe('maxMintAmountAtom', () => {
  describe('early returns (guard clauses)', () => {
    it('returns 0n when indexDTF is undefined', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestSetup(), { wrapper })

      act(() => {
        result.current.setIndexDTF(undefined as any)
        result.current.setAssetDistribution({ '0xtoken': parseEther('1') })
        result.current.setBalanceMap({ '0xtoken': parseEther('100') })
      })

      expect(result.current.maxMintAmount).toBe(0n)
    })

    it('returns 0n when assetDistribution is empty', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestSetup(), { wrapper })

      act(() => {
        result.current.setIndexDTF(createMockIndexDTF())
        result.current.setAssetDistribution({})
        result.current.setBalanceMap({ '0xtoken': parseEther('100') })
      })

      expect(result.current.maxMintAmount).toBe(0n)
    })

    it('returns 0n when balanceMap is empty', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestSetup(), { wrapper })

      act(() => {
        result.current.setIndexDTF(createMockIndexDTF())
        result.current.setAssetDistribution({ '0xtoken': parseEther('1') })
        result.current.setBalanceMap({})
      })

      expect(result.current.maxMintAmount).toBe(0n)
    })

    it('returns 0n when asset missing from balanceMap', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestSetup(), { wrapper })

      act(() => {
        result.current.setIndexDTF(createMockIndexDTF())
        result.current.setAssetDistribution({ '0xtokenA': parseEther('1') })
        result.current.setBalanceMap({ '0xtokenB': parseEther('100') })
      })

      expect(result.current.maxMintAmount).toBe(0n)
    })

    it('returns 0n when balance is exactly 0n (falsy check)', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestSetup(), { wrapper })

      act(() => {
        result.current.setIndexDTF(createMockIndexDTF())
        result.current.setAssetDistribution({ '0xtoken': parseEther('1') })
        result.current.setBalanceMap({ '0xtoken': 0n })
      })

      // Note: This tests the !balanceMap[asset] check which is true for 0n
      expect(result.current.maxMintAmount).toBe(0n)
    })
  })

  describe('calculation correctness', () => {
    it('calculates correctly for single asset', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestSetup(), { wrapper })

      act(() => {
        result.current.setIndexDTF(createMockIndexDTF())
        // User has 100 tokens, needs 0.5 per mint -> can mint 200
        result.current.setAssetDistribution({ '0xtoken': parseEther('0.5') })
        result.current.setBalanceMap({ '0xtoken': parseEther('100') })
      })

      expect(result.current.maxMintAmount).toBe(parseEther('200'))
    })

    it('returns minimum across multiple assets (limiting asset)', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestSetup(), { wrapper })

      act(() => {
        result.current.setIndexDTF(createMockIndexDTF())
        // Asset A: 100 balance / 0.5 needed = 200 possible
        // Asset B: 50 balance / 0.25 needed = 200 possible
        // Asset C: 30 balance / 0.2 needed = 150 possible (limiting)
        result.current.setAssetDistribution({
          '0xtokenA': parseEther('0.5'),
          '0xtokenB': parseEther('0.25'),
          '0xtokenC': parseEther('0.2'),
        })
        result.current.setBalanceMap({
          '0xtokenA': parseEther('100'),
          '0xtokenB': parseEther('50'),
          '0xtokenC': parseEther('30'),
        })
      })

      expect(result.current.maxMintAmount).toBe(parseEther('150'))
    })

    it('skips assets with zero distribution (no division by zero)', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestSetup(), { wrapper })

      act(() => {
        result.current.setIndexDTF(createMockIndexDTF())
        result.current.setAssetDistribution({
          '0xtokenA': parseEther('0.5'),
          '0xtokenB': 0n, // zero distribution - should skip
        })
        result.current.setBalanceMap({
          '0xtokenA': parseEther('100'),
          '0xtokenB': parseEther('50'),
        })
      })

      // Should only consider tokenA: 100 / 0.5 = 200
      expect(result.current.maxMintAmount).toBe(parseEther('200'))
    })

    it('handles very small balances correctly', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestSetup(), { wrapper })

      act(() => {
        result.current.setIndexDTF(createMockIndexDTF())
        // User has 0.001 tokens, needs 0.0001 per mint -> can mint 10
        result.current.setAssetDistribution({ '0xtoken': parseEther('0.0001') })
        result.current.setBalanceMap({ '0xtoken': parseEther('0.001') })
      })

      expect(result.current.maxMintAmount).toBe(parseEther('10'))
    })

    it('handles very large balances without overflow', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestSetup(), { wrapper })

      act(() => {
        result.current.setIndexDTF(createMockIndexDTF())
        // 1 billion tokens
        const billion = parseEther('1000000000')
        result.current.setAssetDistribution({ '0xtoken': parseEther('1') })
        result.current.setBalanceMap({ '0xtoken': billion })
      })

      expect(result.current.maxMintAmount).toBe(parseEther('1000000000'))
    })
  })

  describe('precision edge cases', () => {
    it('handles non-divisible amounts (rounds down)', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useTestSetup(), { wrapper })

      act(() => {
        result.current.setIndexDTF(createMockIndexDTF())
        // 100 balance / 3 needed = 33.333... -> should floor
        result.current.setAssetDistribution({ '0xtoken': parseEther('3') })
        result.current.setBalanceMap({ '0xtoken': parseEther('100') })
      })

      const maxMint = result.current.maxMintAmount
      // Result * 3 should not exceed 100 (verifies floor behavior)
      const requiredForResult = (maxMint * parseEther('3')) / parseEther('1')
      expect(requiredForResult).toBeLessThanOrEqual(parseEther('100'))
    })
  })
})

describe('tokensNeedingApprovalAtom', () => {
  it('returns empty array when basket is null', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setIndexDTFBasket(null as any)
    })

    expect(result.current.tokensNeedingApproval).toEqual([])
  })

  it('returns tokens where allowance < required', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    const tokenA = createMockToken('0xTokenA')
    const tokenB = createMockToken('0xTokenB')

    act(() => {
      result.current.setIndexDTFBasket([tokenA, tokenB] as any)
      result.current.setAmount('10')
      result.current.setAssetDistribution({
        '0xTokenA': parseEther('1'),
        '0xTokenB': parseEther('1'),
      })
      result.current.setAllowanceMap({
        '0xtokena': parseEther('5'), // lowercase - less than required
        '0xtokenb': parseEther('20'), // lowercase - enough
      })
    })

    const needsApproval = result.current.tokensNeedingApproval
    expect(needsApproval.length).toBe(1)
    expect(needsApproval[0].address).toBe('0xTokenA')
  })

  // BUG TEST: Address case sensitivity
  it('matches addresses case-insensitively', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    const token = createMockToken('0xABCDEF') // mixed case

    act(() => {
      result.current.setIndexDTFBasket([token] as any)
      result.current.setAmount('10')
      result.current.setAssetDistribution({
        '0xABCDEF': parseEther('1'), // original case
      })
      result.current.setAllowanceMap({
        '0xabcdef': parseEther('5'), // lowercase
      })
    })

    // This test verifies the bug: allowanceMap uses lowercase but
    // assetAmountsMapAtom (requiredAmounts) may not
    const needsApproval = result.current.tokensNeedingApproval

    // If bug exists: required would be 0n (no match), so token wouldn't be returned
    // If fixed: required would be 10e18, allowance is 5e18, so token IS returned
    expect(needsApproval.length).toBe(1)
  })
})
