import { describe, expect, it } from 'vitest'
import { Address } from 'viem'
import { getPancakeSwapUrl } from '../pancake-swap'

const DTF = '0xa0Fe4e0aEca5479705ce996615B2EACB6b6a10Fb' as Address

describe('getPancakeSwapUrl', () => {
  it('sets the DTF as the output currency on bsc when buying', () => {
    expect(getPancakeSwapUrl({ dtfAddress: DTF, isBuy: true })).toBe(
      `https://pancakeswap.finance/swap?chainOut=bsc&outputCurrency=${DTF}`
    )
  })

  it('sets the DTF as the input currency on bsc when selling', () => {
    expect(getPancakeSwapUrl({ dtfAddress: DTF, isBuy: false })).toBe(
      `https://pancakeswap.finance/swap?chainIn=bsc&inputCurrency=${DTF}`
    )
  })
})
