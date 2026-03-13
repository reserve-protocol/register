import { Address, parseUnits } from 'viem'
import { RESERVE_API } from '@/utils/constants'

export const MIN_USD_SIZE = 1
export const DUMMY_SIGNER =
  '0x0000000000000000000000000000000000000001' as Address

export const NATIVE_TOKEN =
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address

export const WRAPPED_NATIVE: Record<number, Address> = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  8453: '0x4200000000000000000000000000000000000006',
  56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
}

export const NATIVE_SYMBOL: Record<number, string> = {
  1: 'WETH',
  8453: 'WETH',
  56: 'WBNB',
  42161: 'WETH',
}

export type SwapLeg = {
  action: string
  address: string[]
  inputToken: string[]
  outputToken: string[]
  impact: number
  input: number
  output: number
  success: boolean
}

export type ZapResult = {
  truePriceImpact: number
  priceImpact: number
  debug?: { priceImpactStats?: SwapLeg[] }
}

export type ZapResponse = {
  status: 'success' | 'error'
  result?: ZapResult
  error?: string
}

export const isNativeToken = (address: string, chainId: number): boolean => {
  const lower = address.toLowerCase()
  return (
    lower === NATIVE_TOKEN.toLowerCase() ||
    lower === WRAPPED_NATIVE[chainId]?.toLowerCase()
  )
}

export const convertUsdToTokenUnits = (
  usdAmount: number,
  price: number,
  decimals: number
): string => {
  if (!price || price === 0) return '0'
  const amount = usdAmount / price
  try {
    return parseUnits(amount.toFixed(6), decimals).toString()
  } catch {
    return '0'
  }
}

export const fetchPriceImpact = async (
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  chainId: number
): Promise<{ priceImpact: number | null; error?: string; swapPath?: SwapLeg[] }> => {
  try {
    const params = new URLSearchParams({
      chainId: chainId.toString(),
      signer: DUMMY_SIGNER,
      tokenIn,
      amountIn,
      tokenOut,
      slippage: '100',
      trade: 'true',
      bypassCache: 'false',
      debug: 'true',
    })

    const url = `${RESERVE_API}api/zapper/${chainId}/swap?${params.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok)
      return { priceImpact: null, error: `API ${response.status}` }

    const data: ZapResponse = await response.json()

    if (data.status === 'success' && data.result) {
      const impact =
        data.result.truePriceImpact !== undefined
          ? data.result.truePriceImpact
          : data.result.priceImpact
      return {
        priceImpact: impact,
        swapPath: data.result.debug?.priceImpactStats,
      }
    }

    return { priceImpact: null, error: data.error }
  } catch {
    return { priceImpact: null, error: 'Fetch failed' }
  }
}

export const fetchZapperTokens = async (
  chainId: number
): Promise<Set<string>> => {
  try {
    const url = `${RESERVE_API}api/zapper/${chainId}/tokens`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) return new Set()

    const data: { tokens: { address: string }[] } = await response.json()
    return new Set(
      (data.tokens || []).map((t) => t.address.toLowerCase())
    )
  } catch {
    return new Set()
  }
}
