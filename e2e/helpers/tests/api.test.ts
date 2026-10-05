import { describe, expect, it } from 'vitest'
import { knownPriceResponse, oneInchFusionQuote } from '../api'
import { MockOverrides } from '../overrides'
import { REGISTRY } from '../registry'
import { loadSnapshot } from '../snapshots'

const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)! // lcap
const priced = loadSnapshot<Array<{ address: string; price: number }>>(
  `${base.snapshotDir}/token-prices.json`
)[0]
const pricedAddress = priced.address.toLowerCase()
// Always admitted (commonByChain) but never captured with a price → $1 lean.
const NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

describe('knownPriceResponse price gaps', () => {
  it('serves captured prices and leans unknown-but-admitted tokens to $1', () => {
    const response = knownPriceResponse(base.chainId, new Set([pricedAddress, NATIVE]))!
    expect(response.find((p) => p.address.toLowerCase() === pricedAddress)?.price).toBe(
      priced.price
    )
    expect(response.find((p) => p.address === NATIVE)?.price).toBe(1)
  })

  it('still fails loud on a token outside the admitted set', () => {
    expect(
      knownPriceResponse(base.chainId, new Set(['0x00000000000000000000000000000000deadbeef']))
    ).toBeUndefined()
  })

  it('omits a gapped token from the response (no $1 lean, no captured price)', () => {
    const overrides = new MockOverrides()
    overrides.priceGap(base.chainId, pricedAddress)
    overrides.priceGap(base.chainId, NATIVE, 'omit')
    const response = knownPriceResponse(
      base.chainId,
      new Set([pricedAddress, NATIVE]),
      overrides
    )!
    expect(response).toEqual([])
  })

  it('zeroes a gapped token instead of leaning it to $1', () => {
    const overrides = new MockOverrides()
    overrides.priceGap(base.chainId, NATIVE, 'zero')
    overrides.priceGap(base.chainId, pricedAddress, 'zero')
    const response = knownPriceResponse(
      base.chainId,
      new Set([pricedAddress, NATIVE]),
      overrides
    )!
    expect(response.find((p) => p.address === NATIVE)?.price).toBe(0)
    expect(response.find((p) => p.address.toLowerCase() === pricedAddress)?.price).toBe(0)
  })

  it('leaves ungapped tokens untouched when another token is gapped', () => {
    const overrides = new MockOverrides()
    overrides.priceGap(base.chainId, NATIVE)
    const response = knownPriceResponse(
      base.chainId,
      new Set([pricedAddress, NATIVE]),
      overrides
    )!
    expect(response).toHaveLength(1)
    expect(response[0].address.toLowerCase()).toBe(pricedAddress)
    expect(response[0].price).toBe(priced.price)
  })
})

describe('1inch Fusion quotes', () => {
  const quote = (search: string) =>
    oneInchFusionQuote(new URL(`https://api.reserve.org/1inch/fusion/quote?${search}`))

  it('answers "no route" on a supported chain so the zapper keeps its pinned quote', () => {
    expect(quote('chainId=8453&tokenIn=0x1&tokenOut=0x2&amountIn=1')).toEqual({
      status: 'ok',
      result: expect.objectContaining({ available: false }),
    })
  })

  it('fails loud for a chain the app does not quote on', () => {
    expect(quote('chainId=42161&tokenIn=0x1&tokenOut=0x2&amountIn=1')).toBeUndefined()
    expect(quote('tokenIn=0x1')).toBeUndefined()
  })
})
