import { Address } from 'viem'
import { Token } from '../types'

/**
 * Default zappable tokens by chain ID
 * These are common tokens that can be used to zap into DTFs
 */
export const reducedZappableTokens: Record<number, Token[]> = {
  // Mainnet
  1: [
    {
      address: '0xA0b86a33E6411f5d7cb36C04f73C8C6bc6462b5b' as Address,
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      chainId: 1,
    },
    {
      address: '0xA0b86a33E6411f5d7cb36C04f73C8C6bc6462b5b' as Address,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 1,
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' as Address,
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      chainId: 1,
    },
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 1,
    },
  ],
  // Base
  8453: [
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 8453,
    },
    {
      address: '0x4200000000000000000000000000000000000006' as Address,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 8453,
    },
  ],
  // Arbitrum
  42161: [
    {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Address,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 42161,
    },
    {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' as Address,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 42161,
    },
  ],
}

/**
 * Get default tokens for a given chain - UNUSED UTILITY FUNCTIONS
 * These functions are kept for future use when token selection is expanded
 */
// export function getDefaultTokensForChain(chainId: number): Token[] {
//   return reducedZappableTokens[chainId] || []
// }

// /**
//  * Get the first default token for a given chain (typically USDC or USDT)
//  */
// export function getDefaultTokenForChain(chainId: number): Token | null {
//   const tokens = getDefaultTokensForChain(chainId)
//   return tokens.length > 0 ? tokens[0] : null
// }