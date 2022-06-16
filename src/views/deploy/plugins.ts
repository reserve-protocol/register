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
    address: '0x0000000000000000000000000000000000000001',
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
    address: '0x0000000000000000000000000000000000000002',
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
    address: '0x0000000000000000000000000000000000000004',
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
    address: '0x0000000000000000000000000000000000000005',
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
    address: '0x0000000000000000000000000000000000000005',
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
    address: '0x0000000000000000000000000000000000000006',
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
    address: '0x0000000000000000000000000000000000000007',
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
    address: '0x0000000000000000000000000000000000000008',
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
