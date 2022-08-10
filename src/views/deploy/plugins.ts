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
  rewardToken: string // yield token aave / compound wrapped Asset
  custom?: boolean
}

export const TARGET_UNITS = {
  USD: 'USD',
  EUR: 'EUR',
  ETH: 'ETH',
  BTC: 'BTC',
}

export const REWARD_TOKEN = {
  COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  AAVE: '0x4da27a545c0c5B758a6BA100e3a049001de870f5',
}

const collateralPlugins: CollateralPlugin[] = [
  // FIAT COLLATERAL
  {
    symbol: 'DAI',
    address: '0x26B862f640357268Bd2d9E95bc81553a2Aa81D7E',
    decimals: 18,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'DAI',
    collateralToken: 'DAI',
    description: 'Used in RSV',
    collateralAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    rewardToken: ZERO_ADDRESS,
  },
  {
    symbol: 'USDC',
    address: '0xA56F946D6398Dd7d9D4D9B337Cf9E0F68982ca5B',
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDC',
    collateralToken: 'USDC',
    description: 'Used in RSV',
    collateralAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    rewardToken: ZERO_ADDRESS,
  },
  {
    symbol: 'USDT',
    address: '0x5D42EBdBBa61412295D7b0302d6F50aC449Ddb4F',
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDT',
    collateralToken: 'USDT',
    description: 'Used in RSV',
    collateralAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    rewardToken: ZERO_ADDRESS,
  },
  // YIELD TOKEN COLLATERAL
  {
    symbol: 'aDAI',
    address: '0xB06c856C8eaBd1d8321b687E188204C1018BC4E5',
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'DAI',
    collateralToken: 'aDAI',
    description: 'Used in RSV',
    collateralAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    rewardToken: REWARD_TOKEN.AAVE,
  },
  {
    symbol: 'cDAI',
    address: '0xaB7B4c595d3cE8C85e16DA86630f2fc223B05057',
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'DAI',
    collateralToken: 'cDAI',
    description: 'Used in RSV',
    collateralAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    rewardToken: REWARD_TOKEN.COMP,
  },
  {
    symbol: 'cWBTC',
    address: '0xAD523115cd35a8d4E60B3C0953E0E0ac10418309',
    decimals: 18,
    targetUnit: TARGET_UNITS.BTC,
    referenceUnit: 'WBTC',
    collateralToken: 'cWBTC',
    description: 'Used in RSV',
    collateralAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    rewardToken: REWARD_TOKEN.COMP,
  },
  {
    symbol: 'cETH',
    address: '0x045857BDEAE7C1c7252d611eB24eB55564198b4C',
    decimals: 18,
    targetUnit: TARGET_UNITS.ETH,
    referenceUnit: 'ETH',
    collateralToken: 'cETH',
    description: 'Used in RSV',
    collateralAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // TODO? wETH?
    rewardToken: REWARD_TOKEN.COMP,
  },
  {
    symbol: 'wBTC',
    address: '0x2b5A4e5493d4a54E717057B127cf0C000C876f9B',
    decimals: 6,
    targetUnit: TARGET_UNITS.BTC,
    referenceUnit: 'wBTC',
    collateralToken: 'wBTC',
    description: 'Used in RSV',
    collateralAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    rewardToken: ZERO_ADDRESS,
  },
  {
    symbol: 'EURT',
    address: '0x02df3a3F960393F5B349E40A599FEda91a7cc1A7',
    decimals: 6,
    targetUnit: TARGET_UNITS.EUR,
    referenceUnit: 'EURT',
    collateralToken: 'EURT',
    description: 'Used in RSV',
    collateralAddress: '0xC581b735A1688071A1746c968e0798D642EDE491',
    rewardToken: ZERO_ADDRESS,
  },
]

export default collateralPlugins
