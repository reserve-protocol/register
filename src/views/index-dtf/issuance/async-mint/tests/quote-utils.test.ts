import { AsyncZapQuote, TokenInfo } from '@reserve-protocol/async-zap-sdk'
import { describe, expect, it } from 'vitest'
import { parseUnits } from 'viem'
import {
  ceilDiv,
  formatOrderCountdown,
  getQuoteTokenSpent,
  subtractMintFee,
} from '../quote-utils'

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

describe('quote-utils', () => {
  it('formats order countdowns', () => {
    expect(formatOrderCountdown(-1)).toBe('0s')
    expect(formatOrderCountdown(0)).toBe('0s')
    expect(formatOrderCountdown(9)).toBe('9s')
    expect(formatOrderCountdown(65)).toBe('1m 05s')
  })

  it('rounds bigint division up', () => {
    expect(ceilDiv(10n, 3n)).toBe(4n)
    expect(ceilDiv(9n, 3n)).toBe(3n)
    expect(ceilDiv(9n, 0n)).toBe(0n)
  })

  it('subtracts mint fee from shares', () => {
    const shares = parseUnits('100', 18)
    const onePercentFee = parseUnits('0.01', 18)

    expect(subtractMintFee(shares, onePercentFee)).toBe(parseUnits('99', 18))
  })

  it('includes direct quote-token collateral in spent amount once', () => {
    const usdc = token('0x0000000000000000000000000000000000000001', 'USDC', 6)
    const quote = {
      totalQuoteTokenAmount: parseUnits('100', 6),
      legs: [
        {
          asset: usdc,
          quoteTokenAmount: parseUnits('100', 6),
          balanceUsed: parseUnits('10', 6),
        },
      ],
      folioAssets: [{ asset: usdc, amount: parseUnits('120', 6) }],
    } as unknown as AsyncZapQuote

    expect(getQuoteTokenSpent(quote, usdc.address)).toBe(parseUnits('110', 6))
  })

  it('does not subtract from spent amount when direct collateral is already covered', () => {
    const usdc = token('0x0000000000000000000000000000000000000001', 'USDC', 6)
    const quote = {
      totalQuoteTokenAmount: parseUnits('100', 6),
      legs: [
        {
          asset: usdc,
          quoteTokenAmount: parseUnits('100', 6),
          balanceUsed: parseUnits('10', 6),
        },
      ],
      folioAssets: [{ asset: usdc, amount: parseUnits('90', 6) }],
    } as unknown as AsyncZapQuote

    expect(getQuoteTokenSpent(quote, usdc.address)).toBe(parseUnits('100', 6))
  })
})
