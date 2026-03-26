import { describe, it, expect } from 'vitest'
import { Address, parseEther, parseUnits } from 'viem'
import {
  checkMintFeasibility,
  calculateTopUp,
  calculateReducedMint,
  calculateReversalEstimate,
} from '../hooks/use-recovery'

const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' as Address
const WBTC = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' as Address
const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f' as Address

describe('checkMintFeasibility', () => {
  it('returns true when all assets have sufficient balance', () => {
    const result = checkMintFeasibility(
      {
        [WETH.toLowerCase() as Address]: parseEther('1'),
        [WBTC.toLowerCase() as Address]: parseUnits('0.1', 8),
      },
      [parseEther('0.5'), parseUnits('0.05', 8)],
      [WETH, WBTC]
    )
    expect(result).toBe(true)
  })

  it('returns false when any asset is short', () => {
    const result = checkMintFeasibility(
      {
        [WETH.toLowerCase() as Address]: parseEther('0.3'), // Short!
        [WBTC.toLowerCase() as Address]: parseUnits('0.1', 8),
      },
      [parseEther('0.5'), parseUnits('0.05', 8)],
      [WETH, WBTC]
    )
    expect(result).toBe(false)
  })

  it('returns false with empty assets', () => {
    expect(checkMintFeasibility({}, [], [])).toBe(false)
  })

  it('returns false when acquired balance is zero', () => {
    const result = checkMintFeasibility(
      {},
      [parseEther('0.5')],
      [WETH]
    )
    expect(result).toBe(false)
  })

  it('returns true when balance exactly matches required', () => {
    const result = checkMintFeasibility(
      { [WETH.toLowerCase() as Address]: parseEther('0.5') },
      [parseEther('0.5')],
      [WETH]
    )
    expect(result).toBe(true)
  })

  it('handles mixed-decimal tokens (WBTC 8 decimals)', () => {
    const result = checkMintFeasibility(
      {
        [WETH.toLowerCase() as Address]: parseEther('1'),
        [WBTC.toLowerCase() as Address]: parseUnits('0.04', 8), // Short — 0.04 < 0.05
      },
      [parseEther('0.5'), parseUnits('0.05', 8)],
      [WETH, WBTC]
    )
    expect(result).toBe(false)
  })
})

describe('calculateTopUp', () => {
  it('calculates correct shortfall', () => {
    const result = calculateTopUp(10000, 9650)
    expect(result.topUpAmount).toBe(350)
  })

  it('returns zero when no shortfall', () => {
    const result = calculateTopUp(10000, 10000)
    expect(result.topUpAmount).toBe(0)
  })

  it('handles over-acquired (no negative)', () => {
    const result = calculateTopUp(10000, 11000)
    expect(result.topUpAmount).toBe(0)
  })
})

describe('calculateReducedMint', () => {
  it('calculates reduced shares from acquired balances', () => {
    const folioAmount = parseEther('10')
    const result = calculateReducedMint({
      acquiredBalances: {
        [WETH.toLowerCase() as Address]: parseEther('5'), // Half of what's needed
        [DAI.toLowerCase() as Address]: parseEther('10000'), // Full
      },
      assets: [WETH, DAI],
      mintValues: [parseEther('10'), parseEther('10000')],
      folioAmount,
      dtfPrice: 100,
      slippageBps: 100,
    })

    // WETH is the bottleneck: can mint 5 * 10 / 10 = 5
    expect(result.reducedShares).toBe(parseEther('5'))
  })

  it('returns empty for empty assets', () => {
    const result = calculateReducedMint({
      acquiredBalances: {},
      assets: [],
      mintValues: [],
      folioAmount: 0n,
      dtfPrice: 100,
      slippageBps: 100,
    })
    expect(result.reducedShares).toBe(0n)
    expect(result.unusedCollateral).toEqual({})
  })

  it('calculates unused collateral correctly', () => {
    const folioAmount = parseEther('10')
    const result = calculateReducedMint({
      acquiredBalances: {
        [WETH.toLowerCase() as Address]: parseEther('3'), // Bottleneck
        [DAI.toLowerCase() as Address]: parseEther('10000'),
      },
      assets: [WETH, DAI],
      mintValues: [parseEther('10'), parseEther('10000')],
      folioAmount,
      dtfPrice: 100,
      slippageBps: 100,
    })

    // reducedShares = 3 * 10 / 10 = 3
    // DAI used = 3 * 10000 / 10 = 3000, unused = 10000 - 3000 = 7000
    expect(result.unusedCollateral[DAI]).toBe(parseEther('7000'))
  })

  it('correctly handles first asset with zero mintValue', () => {
    const ZERO_TOKEN = '0x0000000000000000000000000000000000000001' as Address
    const folioAmount = parseEther('10')
    const result = calculateReducedMint({
      acquiredBalances: {
        [ZERO_TOKEN.toLowerCase() as Address]: parseEther('100'),
        [WETH.toLowerCase() as Address]: parseEther('5'),
        [DAI.toLowerCase() as Address]: parseEther('10000'),
      },
      assets: [ZERO_TOKEN, WETH, DAI],
      mintValues: [0n, parseEther('10'), parseEther('10000')],
      folioAmount,
      dtfPrice: 100,
      slippageBps: 100,
    })

    // WETH is the bottleneck: 5 * 10 / 10 = 5 (zero-mintValue token excluded)
    expect(result.reducedShares).toBe(parseEther('5'))
  })

  it('returns 0n when a participating token has zero balance', () => {
    const folioAmount = parseEther('10')
    const result = calculateReducedMint({
      acquiredBalances: {
        [WETH.toLowerCase() as Address]: parseEther('5'),
        // DAI not acquired (0 balance) — this is the bottleneck
      },
      assets: [WETH, DAI],
      mintValues: [parseEther('10'), parseEther('10000')],
      folioAmount,
      dtfPrice: 100,
      slippageBps: 100,
    })

    // No DAI = can't mint anything
    expect(result.reducedShares).toBe(0n)
  })

  it('calculates swapLossEstimate from slippageBps', () => {
    const result = calculateReducedMint({
      acquiredBalances: { [WETH.toLowerCase() as Address]: parseEther('10') },
      assets: [WETH],
      mintValues: [parseEther('10')],
      folioAmount: parseEther('10'),
      dtfPrice: 100,
      slippageBps: 250, // 2.5%
    })

    expect(result.swapLossEstimate).toBeCloseTo(2.5, 1)
  })

  it('handles single-token DTF', () => {
    const folioAmount = parseEther('10')
    const result = calculateReducedMint({
      acquiredBalances: {
        [WETH.toLowerCase() as Address]: parseEther('7'),
      },
      assets: [WETH],
      mintValues: [parseEther('10')],
      folioAmount,
      dtfPrice: 100,
      slippageBps: 100,
    })

    // 7 * 10 / 10 = 7
    expect(result.reducedShares).toBe(parseEther('7'))
    expect(result.unusedCollateral).toEqual({})
  })
})

describe('calculateReversalEstimate', () => {
  it('estimates return with slippage', () => {
    const result = calculateReversalEstimate(
      { [WETH.toLowerCase() as Address]: parseEther('1') },
      { [WETH.toLowerCase() as Address]: 2000 },
      { [WETH.toLowerCase() as Address]: 18 },
      100 // 1% slippage
    )

    // 1 ETH * $2000 * 0.99 = $1980
    expect(result.estimatedReturn).toBeCloseTo(1980, 0)
  })

  it('returns zero for empty collateral', () => {
    const result = calculateReversalEstimate({}, {}, {}, 100)
    expect(result.estimatedReturn).toBe(0)
  })

  it('handles multiple tokens', () => {
    const result = calculateReversalEstimate(
      {
        [WETH.toLowerCase() as Address]: parseEther('1'),
        [DAI.toLowerCase() as Address]: parseEther('1000'),
      },
      {
        [WETH.toLowerCase() as Address]: 2000,
        [DAI.toLowerCase() as Address]: 1,
      },
      {
        [WETH.toLowerCase() as Address]: 18,
        [DAI.toLowerCase() as Address]: 18,
      },
      100
    )

    // 1 ETH * $2000 * 0.99 + 1000 DAI * $1 * 0.99 = $1980 + $990 = $2970
    expect(result.estimatedReturn).toBeCloseTo(2970, 0)
  })

  it('handles missing price for a token (defaults to 0)', () => {
    const result = calculateReversalEstimate(
      {
        [WETH.toLowerCase() as Address]: parseEther('1'),
        [WBTC.toLowerCase() as Address]: parseUnits('0.1', 8),
      },
      { [WETH.toLowerCase() as Address]: 2000 }, // No WBTC price
      {
        [WETH.toLowerCase() as Address]: 18,
        [WBTC.toLowerCase() as Address]: 8,
      },
      100
    )

    // Only WETH contributes: 1 * 2000 * 0.99 = 1980
    expect(result.estimatedReturn).toBeCloseTo(1980, 0)
  })

  it('handles missing decimals for a token (defaults to 18)', () => {
    const UNKNOWN = '0x1111111111111111111111111111111111111111' as Address
    const result = calculateReversalEstimate(
      { [UNKNOWN.toLowerCase() as Address]: parseEther('100') },
      { [UNKNOWN.toLowerCase() as Address]: 10 },
      {}, // No decimals entry — defaults to 18
      100
    )

    // 100 * $10 * 0.99 = $990
    expect(result.estimatedReturn).toBeCloseTo(990, 0)
  })

  it('calculates loss correctly', () => {
    const result = calculateReversalEstimate(
      { [WETH.toLowerCase() as Address]: parseEther('1') },
      { [WETH.toLowerCase() as Address]: 2000 },
      { [WETH.toLowerCase() as Address]: 18 },
      100
    )

    // loss = 2000 - 1980 = 20
    expect(result.loss).toBeCloseTo(20, 0)
  })

  it('handles zero slippage', () => {
    const result = calculateReversalEstimate(
      { [WETH.toLowerCase() as Address]: parseEther('1') },
      { [WETH.toLowerCase() as Address]: 2000 },
      { [WETH.toLowerCase() as Address]: 18 },
      0
    )

    expect(result.estimatedReturn).toBeCloseTo(2000, 0)
    expect(result.loss).toBeCloseTo(0, 0)
  })

  it('handles WBTC 8-decimal token correctly', () => {
    const result = calculateReversalEstimate(
      { [WBTC.toLowerCase() as Address]: parseUnits('0.5', 8) },
      { [WBTC.toLowerCase() as Address]: 60000 },
      { [WBTC.toLowerCase() as Address]: 8 },
      100
    )

    // 0.5 BTC * $60000 * 0.99 = $29700
    expect(result.estimatedReturn).toBeCloseTo(29700, 0)
  })
})
