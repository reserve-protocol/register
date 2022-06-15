import { ZERO_ADDRESS } from 'utils/addresses'

export interface CollateralPlugin {
  symbol: string // collateral symbol
  address: string // collateral plugin address
  decimals: number // 6-18
  targetUnit: string // USD / EUR / etc
  referenceUnit: string // Underlay ERC20 (USDC)
  collateralToken: string // Wrapper token (usually yield token)
  collateralAddress: string
  description: string // Small description
  oracle: string
  oracleAddress: string
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
    collateralAddress: ZERO_ADDRESS,
    oracle: 'chainlink',
    oracleAddress: ZERO_ADDRESS,
  },
  {
    symbol: 'cUSDT',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDT',
    collateralToken: 'USDT',
    description: 'Used in RSV',
    collateralAddress: ZERO_ADDRESS,
    oracle: 'chainlink',
    oracleAddress: ZERO_ADDRESS,
  },
  {
    symbol: 'aUSDT',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDT',
    collateralToken: 'USDT',
    description: 'Used in RSV',
    collateralAddress: ZERO_ADDRESS,
    oracle: 'chainlink',
    oracleAddress: ZERO_ADDRESS,
  },
  {
    symbol: 'cUSDTs',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDT',
    collateralToken: 'USDT',
    description: 'Used in RSV',
    collateralAddress: ZERO_ADDRESS,
    oracle: 'chainlink',
    oracleAddress: ZERO_ADDRESS,
  },
  {
    symbol: 'eUSDT',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDT',
    collateralToken: 'USDT',
    description: 'Used in RSV',
    collateralAddress: ZERO_ADDRESS,
    oracle: 'chainlink',
    oracleAddress: ZERO_ADDRESS,
  },
  {
    symbol: 'aUSDC',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDC',
    collateralToken: 'USDC',
    description: 'Used in RSV',
    collateralAddress: ZERO_ADDRESS,
    oracle: 'chainlink',
    oracleAddress: ZERO_ADDRESS,
  },
  {
    symbol: 'eUSDC',
    address: ZERO_ADDRESS,
    decimals: 6,
    targetUnit: TARGET_UNITS.EUR,
    referenceUnit: 'USDC',
    collateralToken: 'USDC',
    description: 'Used in RSV',
    collateralAddress: ZERO_ADDRESS,
    oracle: 'chainlink',
    oracleAddress: ZERO_ADDRESS,
  },
  {
    symbol: 'EUR',
    address: ZERO_ADDRESS,
    decimals: 18,
    targetUnit: TARGET_UNITS.EUR,
    referenceUnit: 'EUR',
    collateralToken: 'EUR',
    description: 'Used in RSV',
    collateralAddress: ZERO_ADDRESS,
    oracle: 'chainlink',
    oracleAddress: ZERO_ADDRESS,
  },
]

export default collateralPlugins
