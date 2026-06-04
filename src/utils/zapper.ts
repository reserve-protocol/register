import { Address } from 'viem'
import { ZAPPER_API } from '@/utils/constants'

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

export const isNativeToken = (address: string, chainId: number): boolean => {
  const lower = address.toLowerCase()
  return (
    lower === NATIVE_TOKEN.toLowerCase() ||
    lower === WRAPPED_NATIVE[chainId]?.toLowerCase()
  )
}

export const fetchZapperTokens = async (
  chainId: number
): Promise<Set<string>> => {
  try {
    const url = `${ZAPPER_API}api/zapper/${chainId}/tokens`
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
