import { AsyncZapQuote, TokenInfo } from '@reserve-protocol/async-zap-sdk'
import { describe, expect, it } from 'vitest'
import { parseUnits } from 'viem'
import { calculateDust, getDustTokens } from '../hooks/use-dust'

const token = (
  address: `0x${string}`,
  symbol: string,
  decimals: number
): TokenInfo => ({
  address,
  symbol,
  name: symbol,
  decimals,
})

const usdc = token('0x0000000000000000000000000000000000000001', 'USDC', 6)
const weth = token('0x0000000000000000000000000000000000000002', 'WETH', 18)
const wbtc = token('0x0000000000000000000000000000000000000003', 'WBTC', 8)

describe('useDust helpers', () => {
  it('returns no dust tokens without a quote', () => {
    expect(getDustTokens(undefined, usdc.address)).toEqual([])
  })

  it('dedupes folio assets and excludes the input token', () => {
    const quote = {
      folioAssets: [
        { asset: usdc },
        { asset: weth },
        { asset: weth },
        { asset: wbtc },
      ],
    } as unknown as AsyncZapQuote

    expect(getDustTokens(quote, usdc.address).map((item) => item.symbol)).toEqual(
      ['WETH', 'WBTC']
    )
  })

  it('calculates positive balance deltas as priced dust', () => {
    const result = calculateDust({
      tokens: [weth, wbtc],
      currentBalances: {
        [weth.address.toLowerCase()]: parseUnits('1.5', 18),
        [wbtc.address.toLowerCase()]: parseUnits('0.25', 8),
      },
      startBalances: {
        [weth.address.toLowerCase()]: parseUnits('1', 18),
        [wbtc.address.toLowerCase()]: parseUnits('0.3', 8),
      },
      prices: [
        { address: weth.address, price: 3000, timestamp: 1 },
        { address: wbtc.address, price: 60000, timestamp: 1 },
      ],
    })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].token.symbol).toBe('WETH')
    expect(result.items[0].amount).toBe(0.5)
    expect(result.items[0].usd).toBe(1500)
    expect(result.totalUsd).toBe(1500)
  })

  it('keeps dust with missing prices and values it at zero', () => {
    const result = calculateDust({
      tokens: [weth],
      currentBalances: {
        [weth.address.toLowerCase()]: parseUnits('2', 18),
      },
      startBalances: {
        [weth.address.toLowerCase()]: parseUnits('1', 18),
      },
      prices: [],
    })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].amount).toBe(1)
    expect(result.items[0].usd).toBe(0)
    expect(result.totalUsd).toBe(0)
  })
})
