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
  COMP: '0x87006e75a5B6bE9D1bbF61AC8Cd84f05D9140589',
  AAVE: '0x82EdA215Fa92B45a3a76837C65Ab862b6C7564a8',
}

const collateralPlugins: CollateralPlugin[] = [
  // FIAT COLLATERAL
  {
    symbol: 'DAI',
    address: '0x51C65cd0Cdb1A8A8b79dfc2eE965B1bA0bb8fc89',
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
    address: '0x8fC8CFB7f7362E44E472c690A6e025B80E406458',
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDC',
    collateralToken: 'USDC',
    description: 'Used in RSV',
    collateralAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    rewardToken: ZERO_ADDRESS,
  },
  // {
  //   symbol: 'USDT',
  //   address: '0xC7143d5bA86553C06f5730c8dC9f8187a621A8D4',
  //   decimals: 6,
  //   targetUnit: TARGET_UNITS.USD,
  //   referenceUnit: 'USDT',
  //   collateralToken: 'USDT',
  //   description: 'Used in RSV',
  //   collateralAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  //   rewardToken: ZERO_ADDRESS,
  // },
  // YIELD TOKEN COLLATERAL
  {
    symbol: 'aDAI',
    address: '0xc9952Fc93Fa9bE383ccB39008c786b9f94eAc95d',
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
    address: '0xDde063eBe8E85D666AD99f731B4Dbf8C98F29708',
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
    address: '0xD5724171C2b7f0AA717a324626050BD05767e2C6',
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
    address: '0x70eE76691Bdd9696552AF8d4fd634b3cF79DD529',
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
    address: '0x8B190573374637f144AC8D37375d97fd84cBD3a0',
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
    address: '0x162700d1613DfEC978032A909DE02643bC55df1A',
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
