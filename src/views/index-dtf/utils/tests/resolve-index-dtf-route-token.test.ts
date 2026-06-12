import { describe, expect, it } from 'vitest'
import { getAddress } from 'viem'

import { resolveIndexDtfRouteToken } from '../resolve-index-dtf-route-token'

const catalog = [
  {
    address: '0x8fc660a20b55BE94E7Ded6f47f8e17a2c7813383',
    chainId: 1,
    symbol: 'COMPUTE',
  },
  {
    address: '0xc561439bd5b6a279f61EA2F8a3f0d25D70ff57ad',
    chainId: 56,
    symbol: 'COMPUTE',
  },
  {
    address: '0x5039ece83dc4e0621ebec391128339bd859a84d0',
    chainId: 1,
    symbol: 'PHOTON',
  },
] as const

describe('resolveIndexDtfRouteToken', () => {
  it('returns address routes directly', () => {
    const address = '0x09A823930FAB5b1FdA6e519b1EE33e7DA9bdA0E5'

    expect(
      resolveIndexDtfRouteToken({ catalog, chainId: 1, tokenId: address })
    ).toBe(getAddress(address))
  })

  it('resolves catalog symbols case-insensitively', () => {
    expect(
      resolveIndexDtfRouteToken({ catalog, chainId: 1, tokenId: 'compute' })
    ).toBe(getAddress('0x8fc660a20b55BE94E7Ded6f47f8e17a2c7813383'))
    expect(
      resolveIndexDtfRouteToken({ catalog, chainId: 1, tokenId: 'PHOTON' })
    ).toBe(getAddress('0x5039ece83dc4e0621ebec391128339bd859a84d0'))
  })

  it('scopes duplicate symbols to the route chain', () => {
    expect(
      resolveIndexDtfRouteToken({ catalog, chainId: 56, tokenId: 'compute' })
    ).toBe(getAddress('0xc561439bd5b6a279f61EA2F8a3f0d25D70ff57ad'))
  })

  it('returns null for unknown aliases', () => {
    expect(
      resolveIndexDtfRouteToken({ catalog, chainId: 1, tokenId: 'missing' })
    ).toBeNull()
  })
})
