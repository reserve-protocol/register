import { Address } from 'viem'
import { ChainId } from './chains'
import { Token } from '..'

const reducedMainnetTokens = [
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address,
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
    targetUnit: 'ETH',
  },
  {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    targetUnit: 'ETH',
  },
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address,
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
    targetUnit: 'USD',
  },
]

const reducedBaseTokens = [
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address,
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
    targetUnit: 'ETH',
  },
  {
    address: '0x4200000000000000000000000000000000000006' as Address,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    targetUnit: 'ETH',
  },
  {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
    targetUnit: 'USD',
  },
]

const reducedArbitrumTokens = [
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address,
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
    targetUnit: 'ETH',
  },
  {
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' as Address,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    targetUnit: 'ETH',
  },
  {
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Address,
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
    targetUnit: 'USD',
  },
]

export const reducedZappableTokens: Record<number, Token[]> = {
  [ChainId.Mainnet]: reducedMainnetTokens,
  [ChainId.Base]: reducedBaseTokens,
  [ChainId.Arbitrum]: reducedArbitrumTokens,
}

export const PRICE_IMPACT_THRESHOLD = 3

// Hardcoded Mixpanel token for analytics
export const MIXPANEL_TOKEN = '38b91d7b8b87d95e01c755fb6e2e3b2e'
