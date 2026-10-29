import { afterEach, describe, expect, it, vi } from 'vitest'
import { Token } from '@/types'
import { fetchLiquidityData } from '../hooks/use-liquidity-check'

const basket: Token[] = [
  {
    address: '0xAAaaAAaaaAAaaAAaaaaAAaaaAaAaaAAaaAaaAAAa',
    symbol: 'AAA',
    name: 'Token A',
    decimals: 18,
    price: 2,
  },
  {
    address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    symbol: 'BBB',
    name: 'Token B',
    decimals: 6,
  },
]

const liquidityResponse = {
  market: null,
  totals: { sellUsd: 0, buyUsd: 20_000 },
  assets: [
    {
      address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      side: 'buy',
      amountUsd: 10_000,
      liquidity: { priceImpact: 2.5, level: 'medium', score: 75, counterpart: 'WETH' },
    },
    {
      address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      side: 'buy',
      amountUsd: 10_000,
      liquidity: { priceImpact: 0, level: 'error', score: 0, error: 'no route' },
    },
  ],
}

describe('fetchLiquidityData', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('asks reserve-api for one native-priced buy per basket token', async () => {
    const fetchMock = vi.fn(async () => Response.json(liquidityResponse))
    vi.stubGlobal('fetch', fetchMock)

    await fetchLiquidityData(basket, 8453, 10_000)

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toMatch(/rebalance\/liquidity$/)
    expect(JSON.parse(init.body as string)).toEqual({
      chainId: 8453,
      nativePrice: 0,
      trades: [
        { address: basket[0].address, side: 'buy', amountUsd: 10_000, price: 2, decimals: 18 },
        { address: basket[1].address, side: 'buy', amountUsd: 10_000, price: 0, decimals: 6 },
      ],
    })
  })

  it('keys results by lowercase address and keeps the server percent and level', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(liquidityResponse)))

    const result = await fetchLiquidityData(basket, 8453, 10_000)

    expect(result['0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa']).toMatchObject({
      priceImpact: 2.5,
      liquidityLevel: 'medium',
      counterpart: 'WETH',
    })
    expect(result['0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb']).toMatchObject({
      liquidityLevel: 'error',
      error: 'no route',
    })
  })
})
