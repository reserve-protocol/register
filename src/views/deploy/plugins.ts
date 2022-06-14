import { ZERO_ADDRESS } from 'utils/addresses'

export interface CollateralPlugin {
  symbol: string // collateral symbol
  address: string // collateral plugin address
  decimals: number // 6-18
  targetUnit: string // USD / EUR / etc
  referenceUnit: string // Underlay ERC20 (USDC)
  collateralToken: string // Wrapper token (usually yield token)
  description: string // Small description
  oracle: string
  custom?: boolean
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
    collateralToken: 'USDC',
    description: 'Used in RSV',
    oracle: 'chainlink',
  },
  {
    symbol: 'cUSDT',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDT',
    collateralToken: 'USDT',
    description: 'Used in RSV',
    oracle: 'chainlink',
  },
  {
    symbol: 'aUSDT',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDT',
    collateralToken: 'USDT',
    description: 'Used in RSV',
    oracle: 'chainlink',
  },
  {
    symbol: 'cUSDTs',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDT',
    collateralToken: 'USDT',
    description: 'Used in RSV',
    oracle: 'chainlink',
  },
  {
    symbol: 'eUSDT',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDT',
    collateralToken: 'USDT',
    description: 'Used in RSV',
    oracle: 'chainlink',
  },
  {
    symbol: 'aUSDC',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDC',
    collateralToken: 'USDC',
    description: 'Used in RSV',
    oracle: 'chainlink',
  },
  {
    symbol: 'eUSDC',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.EUR,
    referenceUnit: 'USDC',
    collateralToken: 'USDC',
    description: 'Used in RSV',
    oracle: 'chainlink',
  },
  {
    symbol: 'EUR',
    address: ZERO_ADDRESS,
    decimals: 18,
    targetUnit: TARGET_UNITS.EUR,
    referenceUnit: 'EUR',
    collateralToken: 'EUR',
    description: 'Used in RSV',
    oracle: 'chainlink',
  },
]

export default collateralPlugins
