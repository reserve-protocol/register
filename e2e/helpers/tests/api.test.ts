import { describe, expect, it } from 'vitest'
import { etherscanResponse, knownPriceResponse } from '../api'
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

describe('etherscanResponse', () => {
  const url = (query: string) => new URL(`https://api.etherscan.io/v2/api?chainid=8453&${query}`)

  it('answers ABI lookups as an unverified contract', () => {
    expect(etherscanResponse(url('module=contract&action=getabi&address=0x1'))).toEqual({
      status: 200,
      body: { status: '0', message: 'NOTOK', result: 'Contract source code not verified' },
    })
  })

  it('answers source lookups as an unverified, non-proxy contract', () => {
    const response = etherscanResponse(url('module=contract&action=getsourcecode&address=0x1'))
    expect(response?.body).toMatchObject({
      result: [{ ABI: 'Contract source code not verified', Proxy: '0' }],
    })
  })

  it('leaves every other action unmodeled so it fails loud', () => {
    expect(etherscanResponse(url('module=contract&action=getcontractcreation&address=0x1'))).toBeUndefined()
    expect(etherscanResponse(url('module=account&action=balance&address=0x1'))).toBeUndefined()
  })
})
