import { ZERO_ADDRESS } from 'utils/addresses'
export interface CollateralPlugin {
  symbol: string // collateral symbol
  address: string // collateral plugin address
  decimals: number // 6-18
  targetUnit: string // USD / EUR / etc
  referenceUnit: string // Underlay ERC20 (USDC)
  collateralToken: string // Wrapper token (usually yield token)
  description: string // Small description
}

export const TARGET_UNITS = {
  USD: 'USD',
  EUR: 'EUR',
}

const collateralPlugins: CollateralPlugin[] = [
  {
    symbol: 'cUSDC',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDC',
    collateralToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    description: 'Used in RSV',
  },
  {
    symbol: 'cUSDT',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDT',
    collateralToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    description: 'Used in RSV',
  },
  {
    symbol: 'aUSDC',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDC',
    collateralToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    description: 'Used in RSV',
  },
  {
    symbol: 'eUSDC',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.EUR,
    referenceUnit: 'USDC',
    collateralToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    description: 'Used in RSV',
  },
  {
    symbol: 'EUR',
    address: ZERO_ADDRESS,
    decimals: 18,
    targetUnit: TARGET_UNITS.EUR,
    referenceUnit: 'EUR',
    collateralToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    description: 'Used in RSV',
  },
]
