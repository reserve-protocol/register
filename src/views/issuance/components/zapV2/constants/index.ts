import { ChainId } from 'utils/chains'
import { Address } from 'viem'

const mainnetTokens = [
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address,
    symbol: 'ETH',
    name: 'Ether',
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
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    targetUnit: 'USD',
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' as Address,
    symbol: 'DAI',
    name: 'DAI',
    decimals: 18,
    targetUnit: 'USD',
  },
  {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as Address,
    symbol: 'WBTC',
    name: 'WBTC',
    decimals: 8,
    targetUnit: 'BTC',
  },
  {
    address: '0x853d955aCEf822Db058eb8505911ED77F175b99e' as Address,
    symbol: 'FRAX',
    name: 'FRAX',
    decimals: 18,
    targetUnit: 'USD',
  },
]

const baseTokens = [
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address,
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
    targetUnit: 'ETH',
  },
  {
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA' as Address,
    symbol: 'USDbC',
    name: 'USDbC',
    decimals: 6,
    targetUnit: 'USD',
  },
  {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
    targetUnit: 'USD',
  },
  {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' as Address,
    symbol: 'DAI',
    name: 'DAI',
    decimals: 18,
    targetUnit: 'USD',
  },
  {
    address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22' as Address,
    symbol: 'cbETH',
    name: 'cbETH',
    decimals: 18,
    targetUnit: 'ETH',
  },
  {
    address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452' as Address,
    symbol: 'wstETH',
    name: 'wstETH',
    decimals: 18,
    targetUnit: 'ETH',
  },
]

export const zappableTokens = {
  [ChainId.Mainnet]: mainnetTokens,
  [ChainId.Base]: baseTokens,
}

export const SLIPPAGE_OPTIONS = [100000n, 250000n, 500000n]

export const PRICE_IMPACT_THRESHOLD = 3
