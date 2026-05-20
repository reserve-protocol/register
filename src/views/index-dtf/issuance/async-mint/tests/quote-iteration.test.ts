import { describe, expect, it } from 'vitest'
import { Address, parseEther, parseUnits } from 'viem'
import {
  applyGreedyClamp,
  detectConvergence,
  measureImpactPerToken,
  predictShrinkageTarget,
  sumQuotedCostBaseUnits,
} from '../utils'
import { CollateralAllocation, QuoteResult } from '../types'

const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as Address
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' as Address
const WBTC = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' as Address
const RARE = '0x1111111111111111111111111111111111111111' as Address

const INPUT_DECIMALS = 6
const TOKEN_DECIMALS: Record<Address, number> = {
  [WETH]: 18,
  [WBTC]: 8,
  [RARE]: 18,
}

// Helpers ───────────────────────────────────────────────────────────────

const usdcQuote = (amount: number): QuoteResult => ({
  success: true,
  data: { quote: { sellAmount: parseUnits(amount.toString(), INPUT_DECIMALS).toString() } } as any,
})

const failedQuote = (): QuoteResult => ({ success: false, error: 'failed' })

const allocSwap = (units: bigint): CollateralAllocation => ({
  fromWallet: 0n,
  fromSwap: units,
  usdValue: 0,
  explanation: '',
})

// measureImpactPerToken ─────────────────────────────────────────────────

describe('measureImpactPerToken', () => {
  it('returns zero impact when sellAmount matches reference exactly', () => {
    // 1 WETH at $3000, sellAmount $3000 → impact = 0
    const result = measureImpactPerToken({
      quotes: { [WETH]: usdcQuote(3000) },
      allocation: { [WETH]: allocSwap(parseEther('1')) },
      referencePrices: { [WETH]: 3000 },
      inputTokenDecimals: INPUT_DECIMALS,
      tokenDecimals: TOKEN_DECIMALS,
    })

    expect(result.impacts[WETH]).toBeCloseTo(0, 6)
    expect(result.totalCostUsd).toBeCloseTo(3000, 4)
    expect(result.totalReferenceUsd).toBeCloseTo(3000, 4)
    expect(result.totalImpactWeightedUsd).toBeCloseTo(0, 6)
    expect(result.unreferencedCostUsd).toBe(0)
    expect(result.tokensWithoutReference).toEqual([])
  })

  it('captures 5% positive impact', () => {
    // 1 WETH at $3000 reference, but sellAmount $3150 → 5% impact
    const result = measureImpactPerToken({
      quotes: { [WETH]: usdcQuote(3150) },
      allocation: { [WETH]: allocSwap(parseEther('1')) },
      referencePrices: { [WETH]: 3000 },
      inputTokenDecimals: INPUT_DECIMALS,
      tokenDecimals: TOKEN_DECIMALS,
    })

    expect(result.impacts[WETH]).toBeCloseTo(0.05, 6)
    expect(result.totalImpactWeightedUsd).toBeCloseTo(150, 4)
  })

  it('handles negative impact (price improvement)', () => {
    const result = measureImpactPerToken({
      quotes: { [WETH]: usdcQuote(2940) },
      allocation: { [WETH]: allocSwap(parseEther('1')) },
      referencePrices: { [WETH]: 3000 },
      inputTokenDecimals: INPUT_DECIMALS,
      tokenDecimals: TOKEN_DECIMALS,
    })

    expect(result.impacts[WETH]).toBeCloseTo(-0.02, 6)
  })

  it('aggregates impact across multiple tokens', () => {
    const result = measureImpactPerToken({
      quotes: {
        [WETH]: usdcQuote(3060), // +2% impact on $3000 ref
        [WBTC]: usdcQuote(60600), // +1% impact on $60000 ref
      },
      allocation: {
        [WETH]: allocSwap(parseEther('1')),
        [WBTC]: allocSwap(parseUnits('1', 8)),
      },
      referencePrices: { [WETH]: 3000, [WBTC]: 60000 },
      inputTokenDecimals: INPUT_DECIMALS,
      tokenDecimals: TOKEN_DECIMALS,
    })

    expect(result.totalCostUsd).toBeCloseTo(63660, 2)
    expect(result.totalReferenceUsd).toBeCloseTo(63000, 2)
    expect(result.impacts[WETH]).toBeCloseTo(0.02, 6)
    expect(result.impacts[WBTC]).toBeCloseTo(0.01, 6)
    // 3000·0.02 + 60000·0.01 = 60 + 600 = 660
    expect(result.totalImpactWeightedUsd).toBeCloseTo(660, 2)
  })

  it('excludes tokens without reference price and tracks their cost as unreferenced', () => {
    const result = measureImpactPerToken({
      quotes: {
        [WETH]: usdcQuote(3000),
        [RARE]: usdcQuote(500),
      },
      allocation: {
        [WETH]: allocSwap(parseEther('1')),
        [RARE]: allocSwap(parseEther('10')),
      },
      referencePrices: { [WETH]: 3000 }, // RARE missing
      inputTokenDecimals: INPUT_DECIMALS,
      tokenDecimals: TOKEN_DECIMALS,
    })

    expect(result.impacts[WETH]).toBeCloseTo(0, 6)
    expect(result.impacts[RARE]).toBeUndefined()
    expect(result.unreferencedCostUsd).toBeCloseTo(500, 4)
    expect(result.tokensWithoutReference).toContain(RARE)
    expect(result.totalCostUsd).toBeCloseTo(3500, 4)
  })

  it('skips failed quotes entirely', () => {
    const result = measureImpactPerToken({
      quotes: {
        [WETH]: usdcQuote(3000),
        [WBTC]: failedQuote(),
      },
      allocation: {
        [WETH]: allocSwap(parseEther('1')),
        [WBTC]: allocSwap(parseUnits('1', 8)),
      },
      referencePrices: { [WETH]: 3000, [WBTC]: 60000 },
      inputTokenDecimals: INPUT_DECIMALS,
      tokenDecimals: TOKEN_DECIMALS,
    })

    expect(result.totalCostUsd).toBeCloseTo(3000, 4)
    expect(result.impacts[WBTC]).toBeUndefined()
  })

  it('skips zero-fromSwap allocations', () => {
    const result = measureImpactPerToken({
      quotes: { [WETH]: usdcQuote(3000) },
      allocation: { [WETH]: { ...allocSwap(0n), fromWallet: parseEther('1') } },
      referencePrices: { [WETH]: 3000 },
      inputTokenDecimals: INPUT_DECIMALS,
      tokenDecimals: TOKEN_DECIMALS,
    })

    expect(result.totalCostUsd).toBe(0)
    expect(result.impacts[WETH]).toBeUndefined()
  })

  it('treats zero or negative reference price as unreferenced', () => {
    const result = measureImpactPerToken({
      quotes: { [WETH]: usdcQuote(3000) },
      allocation: { [WETH]: allocSwap(parseEther('1')) },
      referencePrices: { [WETH]: 0 },
      inputTokenDecimals: INPUT_DECIMALS,
      tokenDecimals: TOKEN_DECIMALS,
    })

    expect(result.impacts[WETH]).toBeUndefined()
    expect(result.unreferencedCostUsd).toBeCloseTo(3000, 4)
    expect(result.tokensWithoutReference).toContain(WETH)
  })
})

// predictShrinkageTarget ────────────────────────────────────────────────

describe('predictShrinkageTarget', () => {
  it('linear solve when impact is zero', () => {
    // Want to spend 950 USD on something costing 1000 USD per share-worth
    // → S_new should be ~95% of prevShares
    const result = predictShrinkageTarget({
      prevShares: parseEther('1'),
      totalReferenceUsd: 1000,
      totalImpactWeightedUsd: 0,
      unreferencedCostUsd: 0,
      targetBudgetUsd: 950,
    })

    const sharesFloat = Number(result) / 1e18
    expect(sharesFloat).toBeCloseTo(0.95, 4)
  })

  it('scales down with positive impact', () => {
    // prevShares=1, totalRef=1000, impactWeighted=100 (10% aggregate impact)
    // cost(r) = 1000r + 100r² ; target=950
    // 100r² + 1000r - 950 = 0 → r = (-1000 + sqrt(1e6 + 380000))/200
    //                        = (-1000 + sqrt(1380000))/200 ≈ 0.872
    const result = predictShrinkageTarget({
      prevShares: parseEther('1'),
      totalReferenceUsd: 1000,
      totalImpactWeightedUsd: 100,
      unreferencedCostUsd: 0,
      targetBudgetUsd: 950,
    })

    const sharesFloat = Number(result) / 1e18
    expect(sharesFloat).toBeGreaterThan(0.85)
    expect(sharesFloat).toBeLessThan(0.9)
  })

  it('subtracts unreferenced cost from the target', () => {
    // 200 of the target is consumed by unreferenced tokens scaling linearly
    // → effective target for referenced solve = 950 - 200 = 750... but we model
    // them as scaling linearly with r, so the math is: cost(r) = r·(1000+200) + r²·100 = 950
    const result = predictShrinkageTarget({
      prevShares: parseEther('1'),
      totalReferenceUsd: 1000,
      totalImpactWeightedUsd: 100,
      unreferencedCostUsd: 200,
      targetBudgetUsd: 950,
    })

    const sharesFloat = Number(result) / 1e18
    // 100r² + 1200r − 950 = 0
    // discriminant = 1200² + 4·100·950 = 1,820,000
    // r = (−1200 + √1820000) / 200 ≈ 0.7454
    expect(sharesFloat).toBeCloseTo(0.7454, 3)
  })

  it('returns 0n when target budget is zero or negative', () => {
    expect(
      predictShrinkageTarget({
        prevShares: parseEther('1'),
        totalReferenceUsd: 1000,
        totalImpactWeightedUsd: 0,
        unreferencedCostUsd: 0,
        targetBudgetUsd: 0,
      })
    ).toBe(0n)

    expect(
      predictShrinkageTarget({
        prevShares: parseEther('1'),
        totalReferenceUsd: 1000,
        totalImpactWeightedUsd: 0,
        unreferencedCostUsd: 0,
        targetBudgetUsd: -10,
      })
    ).toBe(0n)
  })

  it('returns 0n when no reference data exists', () => {
    const result = predictShrinkageTarget({
      prevShares: parseEther('1'),
      totalReferenceUsd: 0,
      totalImpactWeightedUsd: 0,
      unreferencedCostUsd: 0,
      targetBudgetUsd: 950,
    })
    expect(result).toBe(0n)
  })

  it('returns 0n when prevShares is zero', () => {
    const result = predictShrinkageTarget({
      prevShares: 0n,
      totalReferenceUsd: 1000,
      totalImpactWeightedUsd: 0,
      unreferencedCostUsd: 0,
      targetBudgetUsd: 950,
    })
    expect(result).toBe(0n)
  })

  it('handles NaN gracefully', () => {
    const result = predictShrinkageTarget({
      prevShares: parseEther('1'),
      totalReferenceUsd: NaN,
      totalImpactWeightedUsd: 0,
      unreferencedCostUsd: 0,
      targetBudgetUsd: 950,
    })
    expect(result).toBe(0n)
  })
})

// applyGreedyClamp ──────────────────────────────────────────────────────

describe('applyGreedyClamp', () => {
  it('returns predicted when it is below greedy bound', () => {
    // prevShares=1, prevCost=1100, target=1000 → greedy = 1000/1100 ≈ 0.909
    // predicted=0.85 (more conservative) → return 0.85
    const result = applyGreedyClamp({
      predicted: parseEther('0.85'),
      prevShares: parseEther('1'),
      prevCostUsd: 1100,
      targetBudgetUsd: 1000,
    })
    const float = Number(result) / 1e18
    expect(float).toBeCloseTo(0.85, 5)
  })

  it('clamps to greedy when predicted exceeds it', () => {
    // predicted=0.95 (too optimistic), greedy=1000/1100=0.909 → return 0.909
    const result = applyGreedyClamp({
      predicted: parseEther('0.95'),
      prevShares: parseEther('1'),
      prevCostUsd: 1100,
      targetBudgetUsd: 1000,
    })
    const float = Number(result) / 1e18
    expect(float).toBeCloseTo(1000 / 1100, 4)
  })

  it('returns 0n when prevCost is zero', () => {
    const result = applyGreedyClamp({
      predicted: parseEther('1'),
      prevShares: parseEther('1'),
      prevCostUsd: 0,
      targetBudgetUsd: 1000,
    })
    expect(result).toBe(0n)
  })

  it('returns 0n when prevShares is zero', () => {
    const result = applyGreedyClamp({
      predicted: parseEther('1'),
      prevShares: 0n,
      prevCostUsd: 1100,
      targetBudgetUsd: 1000,
    })
    expect(result).toBe(0n)
  })

  it('returns greedy when predicted is zero', () => {
    const result = applyGreedyClamp({
      predicted: 0n,
      prevShares: parseEther('1'),
      prevCostUsd: 1100,
      targetBudgetUsd: 1000,
    })
    const float = Number(result) / 1e18
    expect(float).toBeCloseTo(1000 / 1100, 4)
  })
})

// detectConvergence ────────────────────────────────────────────────────

describe('detectConvergence', () => {
  it('converges when feasible and utilization above threshold', () => {
    const result = detectConvergence({
      costUsd: 980,
      adjustedBudgetUsd: 1000,
      prevShares: parseEther('1'),
      newShares: parseEther('1'),
      minUtilization: 0.98,
      marginalThreshold: 0.005,
    })
    expect(result.feasible).toBe(true)
    expect(result.converged).toBe(true)
    expect(result.utilization).toBeCloseTo(0.98, 6)
  })

  it('does not converge when feasible but utilization below threshold and marginal large', () => {
    const result = detectConvergence({
      costUsd: 800,
      adjustedBudgetUsd: 1000,
      prevShares: parseEther('1'),
      newShares: parseEther('0.85'),
      minUtilization: 0.98,
      marginalThreshold: 0.005,
    })
    expect(result.feasible).toBe(true)
    expect(result.converged).toBe(false)
    expect(result.utilization).toBeCloseTo(0.8, 6)
  })

  it('marks infeasible when cost exceeds adjusted budget', () => {
    const result = detectConvergence({
      costUsd: 1050,
      adjustedBudgetUsd: 1000,
      prevShares: parseEther('1'),
      newShares: parseEther('0.95'),
      minUtilization: 0.98,
      marginalThreshold: 0.005,
    })
    expect(result.feasible).toBe(false)
    expect(result.converged).toBe(false)
  })

  it('converges by marginal delta even when utilization is low', () => {
    // Feasible but barely changing shares between rounds → bail
    const result = detectConvergence({
      costUsd: 700,
      adjustedBudgetUsd: 1000,
      prevShares: parseEther('1'),
      newShares: parseEther('0.999'),
      minUtilization: 0.98,
      marginalThreshold: 0.005,
    })
    expect(result.feasible).toBe(true)
    expect(result.marginalDelta).toBeLessThan(0.005)
    expect(result.converged).toBe(true)
  })

  it('does not converge on marginal alone when infeasible', () => {
    const result = detectConvergence({
      costUsd: 1100,
      adjustedBudgetUsd: 1000,
      prevShares: parseEther('1'),
      newShares: parseEther('1'),
      minUtilization: 0.98,
      marginalThreshold: 0.005,
    })
    expect(result.converged).toBe(false)
  })

  it('handles zero budget without dividing by zero', () => {
    const result = detectConvergence({
      costUsd: 100,
      adjustedBudgetUsd: 0,
      prevShares: parseEther('1'),
      newShares: parseEther('1'),
      minUtilization: 0.98,
      marginalThreshold: 0.005,
    })
    expect(result.utilization).toBe(0)
    expect(result.feasible).toBe(false)
  })
})

// sumQuotedCostBaseUnits ───────────────────────────────────────────────

describe('sumQuotedCostBaseUnits', () => {
  it('sums sellAmounts across all successful quotes', () => {
    const result = sumQuotedCostBaseUnits({
      quotes: {
        [WETH]: usdcQuote(3000),
        [WBTC]: usdcQuote(60000),
      },
      allocation: {
        [WETH]: allocSwap(parseEther('1')),
        [WBTC]: allocSwap(parseUnits('1', 8)),
      },
    })

    expect(result.totalBaseUnits).toBe(parseUnits('63000', INPUT_DECIMALS))
    expect(result.allSucceeded).toBe(true)
    expect(result.failedAddresses).toEqual([])
    expect(result.requiredAddresses).toHaveLength(2)
  })

  it('flags failed addresses and still sums successful ones', () => {
    const result = sumQuotedCostBaseUnits({
      quotes: {
        [WETH]: usdcQuote(3000),
        [WBTC]: failedQuote(),
      },
      allocation: {
        [WETH]: allocSwap(parseEther('1')),
        [WBTC]: allocSwap(parseUnits('1', 8)),
      },
    })

    expect(result.totalBaseUnits).toBe(parseUnits('3000', INPUT_DECIMALS))
    expect(result.allSucceeded).toBe(false)
    expect(result.failedAddresses).toContain(WBTC)
  })

  it('ignores allocations with zero fromSwap', () => {
    const result = sumQuotedCostBaseUnits({
      quotes: { [WETH]: usdcQuote(3000) },
      allocation: {
        [WETH]: allocSwap(parseEther('1')),
        [WBTC]: { ...allocSwap(0n), fromWallet: parseUnits('1', 8) },
      },
    })

    expect(result.requiredAddresses).toEqual([WETH])
    expect(result.totalBaseUnits).toBe(parseUnits('3000', INPUT_DECIMALS))
  })

  it('marks empty allocation as not all-succeeded', () => {
    const result = sumQuotedCostBaseUnits({
      quotes: {},
      allocation: {},
    })
    expect(result.totalBaseUnits).toBe(0n)
    expect(result.allSucceeded).toBe(false)
    expect(result.requiredAddresses).toEqual([])
  })
})
