import { describe, it, expect } from 'vitest'
import { Address, parseEther, parseUnits } from 'viem'
import { calculateCollateralAllocation, calculateMaxMintAmount } from '../utils'

const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as Address
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' as Address
const WBTC = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' as Address

const INPUT_TOKEN = { address: USDC, decimals: 6, symbol: 'USDC' }

const DECIMALS: Record<Address, number> = {
  [USDC.toLowerCase() as Address]: 6,
  [WETH.toLowerCase() as Address]: 18,
  [WBTC.toLowerCase() as Address]: 8,
}

describe('calculateCollateralAllocation', () => {
  it('returns empty for zero mint shares', () => {
    const result = calculateCollateralAllocation({
      mintShares: 0n,
      assets: [WETH],
      mintValues: [parseEther('1')],
      balances: {},
      prices: {},
      decimals: DECIMALS,
      selectedCollaterals: new Set<Address>(),
      strategy: 'single',
      inputToken: INPUT_TOKEN,
    })
    expect(result).toEqual({})
  })

  it('returns empty for empty assets', () => {
    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [],
      mintValues: [],
      balances: {},
      prices: {},
      decimals: DECIMALS,
      selectedCollaterals: new Set<Address>(),
      strategy: 'single',
      inputToken: INPUT_TOKEN,
    })
    expect(result).toEqual({})
  })

  it('single strategy: all tokens come from swaps', () => {
    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [WETH, WBTC],
      mintValues: [parseEther('0.5'), parseUnits('0.01', 8)],
      balances: {
        [WETH.toLowerCase() as Address]: parseEther('10'), // User has WETH
        [WBTC.toLowerCase() as Address]: parseUnits('1', 8),
      },
      prices: {
        [WETH.toLowerCase() as Address]: 2000,
        [WBTC.toLowerCase() as Address]: 40000,
      },
      decimals: DECIMALS,
      selectedCollaterals: new Set<Address>([WETH, WBTC]),
      strategy: 'single',
      inputToken: INPUT_TOKEN,
    })

    // With single strategy, no wallet balance should be used
    expect(result[WETH].fromWallet).toBe(0n)
    expect(result[WETH].fromSwap).toBe(parseEther('0.5'))
    expect(result[WBTC].fromWallet).toBe(0n)
    expect(result[WBTC].fromSwap).toBe(parseUnits('0.01', 8))
  })

  it('partial strategy with full wallet coverage: no swaps needed', () => {
    const wethRequired = parseEther('0.5')
    const wbtcRequired = parseUnits('0.01', 8)

    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [WETH, WBTC],
      mintValues: [wethRequired, wbtcRequired],
      balances: {
        [WETH.toLowerCase() as Address]: parseEther('10'),
        [WBTC.toLowerCase() as Address]: parseUnits('1', 8),
      },
      prices: {
        [WETH.toLowerCase() as Address]: 2000,
        [WBTC.toLowerCase() as Address]: 40000,
      },
      decimals: DECIMALS,
      selectedCollaterals: new Set<Address>([WETH, WBTC]),
      strategy: 'partial',
      inputToken: INPUT_TOKEN,
    })

    expect(result[WETH].fromWallet).toBe(wethRequired)
    expect(result[WETH].fromSwap).toBe(0n)
    expect(result[WETH].explanation).toBe('Token at its maximum weight')

    expect(result[WBTC].fromWallet).toBe(wbtcRequired)
    expect(result[WBTC].fromSwap).toBe(0n)
  })

  it('partial strategy with mixed coverage: some from wallet, rest from swap', () => {
    const wethRequired = parseEther('1')
    const walletWeth = parseEther('0.3') // Only 30% coverage

    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [WETH, WBTC],
      mintValues: [wethRequired, parseUnits('0.01', 8)],
      balances: {
        [WETH.toLowerCase() as Address]: walletWeth,
        [WBTC.toLowerCase() as Address]: 0n, // No WBTC
      },
      prices: {
        [WETH.toLowerCase() as Address]: 2000,
        [WBTC.toLowerCase() as Address]: 40000,
      },
      decimals: DECIMALS,
      selectedCollaterals: new Set<Address>([WETH, WBTC]),
      strategy: 'partial',
      inputToken: INPUT_TOKEN,
    })

    // WETH: partial from wallet
    expect(result[WETH].fromWallet).toBe(walletWeth)
    expect(result[WETH].fromSwap).toBe(wethRequired - walletWeth)
    expect(result[WETH].explanation).toBe('Using your full balance')

    // WBTC: all from swap (0 balance)
    expect(result[WBTC].fromWallet).toBe(0n)
    expect(result[WBTC].fromSwap).toBe(parseUnits('0.01', 8))
    expect(result[WBTC].explanation).toBe('Covering the remainder')
  })

  it('weight capping: wallet has more than DTF weight allows', () => {
    const wethRequired = parseEther('0.5')

    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [WETH],
      mintValues: [wethRequired],
      balances: {
        [WETH.toLowerCase() as Address]: parseEther('100'), // Way more than needed
      },
      prices: {
        [WETH.toLowerCase() as Address]: 2000,
      },
      decimals: DECIMALS,
      selectedCollaterals: new Set<Address>([WETH]),
      strategy: 'partial',
      inputToken: INPUT_TOKEN,
    })

    // Capped at required amount
    expect(result[WETH].fromWallet).toBe(wethRequired)
    expect(result[WETH].fromSwap).toBe(0n)
    expect(result[WETH].explanation).toBe('Token at its maximum weight')
  })

  it('skips input token from allocation', () => {
    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [USDC, WETH], // USDC is the input token
      mintValues: [parseUnits('100', 6), parseEther('0.5')],
      balances: {},
      prices: {},
      decimals: DECIMALS,
      selectedCollaterals: new Set<Address>(),
      strategy: 'single',
      inputToken: INPUT_TOKEN,
    })

    // USDC should be skipped
    expect(result[USDC]).toBeUndefined()
    // WETH should be present
    expect(result[WETH]).toBeDefined()
  })

  it('unselected tokens in partial mode are treated as swap-only', () => {
    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [WETH, WBTC],
      mintValues: [parseEther('0.5'), parseUnits('0.01', 8)],
      balances: {
        [WETH.toLowerCase() as Address]: parseEther('10'),
        [WBTC.toLowerCase() as Address]: parseUnits('1', 8),
      },
      prices: {},
      decimals: DECIMALS,
      selectedCollaterals: new Set<Address>([WETH]), // Only WETH selected
      strategy: 'partial',
      inputToken: INPUT_TOKEN,
    })

    // WETH: selected, uses wallet
    expect(result[WETH].fromWallet).toBe(parseEther('0.5'))

    // WBTC: not selected, all from swap despite having balance
    expect(result[WBTC].fromWallet).toBe(0n)
    expect(result[WBTC].fromSwap).toBe(parseUnits('0.01', 8))
  })

  it('calculates usdValue for swap portions using prices', () => {
    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [WETH],
      mintValues: [parseEther('0.5')],
      balances: {},
      prices: { [WETH.toLowerCase() as Address]: 2000 },
      decimals: DECIMALS,
      selectedCollaterals: new Set<Address>(),
      strategy: 'single',
      inputToken: INPUT_TOKEN,
    })

    // 0.5 WETH * $2000 = $1000
    expect(result[WETH].usdValue).toBeCloseTo(1000, 0)
  })

  it('returns usdValue 0 when price is missing', () => {
    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [WETH],
      mintValues: [parseEther('0.5')],
      balances: {},
      prices: {}, // No prices
      decimals: DECIMALS,
      selectedCollaterals: new Set<Address>(),
      strategy: 'single',
      inputToken: INPUT_TOKEN,
    })

    expect(result[WETH].usdValue).toBe(0)
  })

  it('returns usdValue 0 when fromSwap is 0 (full wallet coverage)', () => {
    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [WETH],
      mintValues: [parseEther('0.5')],
      balances: { [WETH.toLowerCase() as Address]: parseEther('10') },
      prices: { [WETH.toLowerCase() as Address]: 2000 },
      decimals: DECIMALS,
      selectedCollaterals: new Set<Address>([WETH]),
      strategy: 'partial',
      inputToken: INPUT_TOKEN,
    })

    // No swap needed — usdValue should be 0
    expect(result[WETH].fromSwap).toBe(0n)
    expect(result[WETH].usdValue).toBe(0)
  })

  it('handles WBTC 8-decimal usdValue correctly', () => {
    const wbtcRequired = parseUnits('0.1', 8) // 0.1 BTC

    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [WBTC],
      mintValues: [wbtcRequired],
      balances: {},
      prices: { [WBTC.toLowerCase() as Address]: 60000 },
      decimals: DECIMALS,
      selectedCollaterals: new Set<Address>(),
      strategy: 'single',
      inputToken: INPUT_TOKEN,
    })

    // 0.1 BTC * $60000 = $6000
    expect(result[WBTC].usdValue).toBeCloseTo(6000, 0)
  })

  it('handles case-insensitive address matching for selectedCollaterals', () => {
    const wethChecksummed = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address
    const wethLower = wethChecksummed.toLowerCase() as Address

    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [wethChecksummed],
      mintValues: [parseEther('0.5')],
      balances: { [wethLower]: parseEther('10') },
      prices: {},
      decimals: { [wethLower]: 18 },
      selectedCollaterals: new Set<Address>([wethLower]), // lowercase in set
      strategy: 'partial',
      inputToken: INPUT_TOKEN,
    })

    // Should still match and use wallet
    expect(result[wethChecksummed].fromWallet).toBe(parseEther('0.5'))
    expect(result[wethChecksummed].fromSwap).toBe(0n)
  })

  it('handles partial strategy with zero wallet balance for selected token', () => {
    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [WETH],
      mintValues: [parseEther('0.5')],
      balances: { [WETH.toLowerCase() as Address]: 0n },
      prices: { [WETH.toLowerCase() as Address]: 2000 },
      decimals: DECIMALS,
      selectedCollaterals: new Set<Address>([WETH]),
      strategy: 'partial',
      inputToken: INPUT_TOKEN,
    })

    // Zero balance means everything from swap
    expect(result[WETH].fromWallet).toBe(0n)
    expect(result[WETH].fromSwap).toBe(parseEther('0.5'))
    expect(result[WETH].explanation).toBe('Covering the remainder')
  })

  it('falls back to 18 decimals for unknown token', () => {
    const UNKNOWN = '0x1111111111111111111111111111111111111111' as Address
    const result = calculateCollateralAllocation({
      mintShares: parseEther('1'),
      assets: [UNKNOWN],
      mintValues: [parseEther('100')],
      balances: {},
      prices: { [UNKNOWN.toLowerCase() as Address]: 10 },
      decimals: {}, // No decimals entry — falls back to 18
      selectedCollaterals: new Set<Address>(),
      strategy: 'single',
      inputToken: INPUT_TOKEN,
    })

    // 100 tokens * $10 = $1000 (using 18 decimals fallback)
    expect(result[UNKNOWN].usdValue).toBeCloseTo(1000, 0)
  })
})

describe('calculateMaxMintAmount', () => {
  it('returns input token balance for single strategy', () => {
    const result = calculateMaxMintAmount({
      inputTokenBalance: 3000,
      walletBalances: {
        [WETH.toLowerCase() as Address]: parseEther('1'),
      },
      tokenPrices: { [WETH.toLowerCase() as Address]: 2000 },
      tokenDecimals: DECIMALS,
      selectedCollaterals: new Set<Address>([WETH]),
      strategy: 'single',
      inputTokenAddress: USDC,
    })
    expect(result).toBe(3000)
  })

  it('adds selected collateral value for partial strategy', () => {
    const result = calculateMaxMintAmount({
      inputTokenBalance: 3000, // $3k USDC
      walletBalances: {
        [WETH.toLowerCase() as Address]: parseEther('1'), // 1 WETH = $2000
        [WBTC.toLowerCase() as Address]: parseUnits('0.125', 8), // 0.125 BTC = $5000
      },
      tokenPrices: {
        [WETH.toLowerCase() as Address]: 2000,
        [WBTC.toLowerCase() as Address]: 40000,
      },
      tokenDecimals: DECIMALS,
      selectedCollaterals: new Set<Address>([WETH, WBTC]),
      strategy: 'partial',
      inputTokenAddress: USDC,
    })
    // $3000 + $2000 + $5000 = $10000
    expect(result).toBe(10000)
  })

  it('skips input token in collateral value (no double-counting)', () => {
    const result = calculateMaxMintAmount({
      inputTokenBalance: 3000,
      walletBalances: {
        [USDC.toLowerCase() as Address]: parseUnits('3000', 6), // input token
        [WETH.toLowerCase() as Address]: parseEther('1'),
      },
      tokenPrices: {
        [USDC.toLowerCase() as Address]: 1,
        [WETH.toLowerCase() as Address]: 2000,
      },
      tokenDecimals: DECIMALS,
      selectedCollaterals: new Set<Address>([USDC, WETH]),
      strategy: 'partial',
      inputTokenAddress: USDC,
    })
    // $3000 (input) + $2000 (WETH) — USDC not double-counted
    expect(result).toBe(5000)
  })

  it('skips unselected tokens', () => {
    const result = calculateMaxMintAmount({
      inputTokenBalance: 3000,
      walletBalances: {
        [WETH.toLowerCase() as Address]: parseEther('1'),
        [WBTC.toLowerCase() as Address]: parseUnits('1', 8),
      },
      tokenPrices: {
        [WETH.toLowerCase() as Address]: 2000,
        [WBTC.toLowerCase() as Address]: 40000,
      },
      tokenDecimals: DECIMALS,
      selectedCollaterals: new Set<Address>([WETH]), // Only WETH selected
      strategy: 'partial',
      inputTokenAddress: USDC,
    })
    // $3000 + $2000 (WETH only, WBTC not selected)
    expect(result).toBe(5000)
  })

  it('returns input balance when wallet data is empty', () => {
    const result = calculateMaxMintAmount({
      inputTokenBalance: 3000,
      walletBalances: {},
      tokenPrices: {},
      tokenDecimals: {},
      selectedCollaterals: new Set<Address>([WETH]),
      strategy: 'partial',
      inputTokenAddress: USDC,
    })
    expect(result).toBe(3000)
  })

  it('handles case-insensitive addresses', () => {
    const wethChecksummed =
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address
    const wethLower = wethChecksummed.toLowerCase() as Address

    const result = calculateMaxMintAmount({
      inputTokenBalance: 1000,
      walletBalances: {
        [wethLower]: parseEther('1'),
      },
      tokenPrices: {
        [wethLower]: 2000,
      },
      tokenDecimals: { [wethLower]: 18 },
      selectedCollaterals: new Set<Address>([wethChecksummed]), // checksummed in set
      strategy: 'partial',
      inputTokenAddress: USDC,
    })
    // $1000 + $2000 = $3000
    expect(result).toBe(3000)
  })
})
