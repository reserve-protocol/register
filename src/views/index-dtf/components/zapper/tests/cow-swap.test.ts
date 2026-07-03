import { describe, expect, it } from 'vitest'
import { getCowSwapUrl } from '../cow-swap'

const NATIVE = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const DTF = '0xa0Fe4e0aEca5479705ce996615B2EACB6b6a10Fb'

describe('getCowSwapUrl', () => {
  it('builds a sell/buy pair URL keyed by chain id', () => {
    expect(
      getCowSwapUrl({ chainId: 8453, sellToken: USDC, buyToken: DTF })
    ).toBe(`https://swap.cow.fi/#/8453/swap/${USDC}/${DTF}`)
  })

  it('maps the native placeholder to the chain gas-token symbol on either side', () => {
    expect(
      getCowSwapUrl({ chainId: 56, sellToken: NATIVE, buyToken: DTF })
    ).toBe(`https://swap.cow.fi/#/56/swap/BNB/${DTF}`)
    expect(
      getCowSwapUrl({ chainId: 1, sellToken: DTF, buyToken: NATIVE })
    ).toBe(`https://swap.cow.fi/#/1/swap/${DTF}/ETH`)
  })

  it('omits the buy segment when the counter-token is unknown', () => {
    expect(getCowSwapUrl({ chainId: 56, sellToken: DTF })).toBe(
      `https://swap.cow.fi/#/56/swap/${DTF}`
    )
  })
})
