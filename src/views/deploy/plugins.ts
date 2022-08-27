import { ChainId, CHAIN_ID } from 'utils/chains'
import {
  COMPOUND_ADDRESS,
  STAKE_AAVE_ADDRESS,
  ZERO_ADDRESS,
} from 'utils/addresses'

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

// "DAI": "0xB2b615835F802E4eEa239D1F5Ec5fC85DEF14f9A",
// "USDC": "0xE0914207d775FA217A07DFfDA71f9ab0427D9462",
// "USDT": "0x921469B843D10F8C55175a6a2Bc45EAe225E3fB2",
// "USDP": "0xB83B79Ac1A5e5d189936A979A984bECa5c541B33",
// "TUSD": "0xedF5604529358E9571fc8F8Aa92B3c17B5947Ea7",
// "BUSD": "0x07B10BbF34cB88e155bC4B2529EaE5691380139B",
// "aDAI": "0xA348a2FDB75c8620558b329462c30DBA753A8A79",
// "aUSDC": "0x4AA65fd32Bada23C6F5D39378c02825b9093De3A",
// "aUSDT": "0xEb86887aB74e6e3fC80cbe10C50F50a5E8d1Cfe3",
// "aBUSD": "0x91e82f21e1aa7E85ee43FA456652d912fD90E296",
// "cDAI": "0xdc09753894a3F80B8D7EF1D6696ECc7fA3244C21",
// "cUSDC": "0x6EF4b511E5dDaAA5f89Df17CA0F999dE5f104305",
// "cUSDT": "0xef901A5E4C8A525340e11Aaa007fab912631bf36",
// "cWBTC": "0xa2fC3a92fDf545B4BC6a7bEE038Ab0e8e05a70a1",
// "cETH": "0x25d6C3deAe1Fc0530516Bce5459F458f0d7d7086",
// "WBTC": "0xaFb62B600377010EC224B5b61973f67d2bACE909",
// "WETH": "0xBDD42A8e207243BCbC1fECF4238db53dCe9B55F2",
// "EURT": "0x9fF645a81dF82C6eF09B596bE1736bFbc6B7dA90"

const collateralPlugins: { [chainId: number]: CollateralPlugin[] } = {
  [ChainId.Mainnet]: [
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
      rewardToken: STAKE_AAVE_ADDRESS[CHAIN_ID],
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
      rewardToken: COMPOUND_ADDRESS[CHAIN_ID],
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
      rewardToken: COMPOUND_ADDRESS[CHAIN_ID],
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
      rewardToken: COMPOUND_ADDRESS[CHAIN_ID],
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
  ],
  [ChainId.Goerli]: [
    // FIAT COLLATERAL
    {
      symbol: 'DAI',
      address: '0xB2b615835F802E4eEa239D1F5Ec5fC85DEF14f9A',
      decimals: 18,
      targetUnit: TARGET_UNITS.USD,
      referenceUnit: 'DAI',
      collateralToken: 'DAI',
      description: 'Used in RSV',
      collateralAddress: '0xB2b615835F802E4eEa239D1F5Ec5fC85DEF14f9A',
      rewardToken: ZERO_ADDRESS,
    },
    {
      symbol: 'USDC',
      address: '0xE0914207d775FA217A07DFfDA71f9ab0427D9462',
      decimals: 6,
      targetUnit: TARGET_UNITS.USD,
      referenceUnit: 'USDC',
      collateralToken: 'USDC',
      description: 'Used in RSV',
      collateralAddress: '0xE0914207d775FA217A07DFfDA71f9ab0427D9462',
      rewardToken: ZERO_ADDRESS,
    },
    {
      symbol: 'USDT',
      address: '0x921469B843D10F8C55175a6a2Bc45EAe225E3fB2',
      decimals: 6,
      targetUnit: TARGET_UNITS.USD,
      referenceUnit: 'USDT',
      collateralToken: 'USDT',
      description: 'Used in RSV',
      collateralAddress: '0x921469B843D10F8C55175a6a2Bc45EAe225E3fB2',
      rewardToken: ZERO_ADDRESS,
    },
    // YIELD TOKEN COLLATERAL
    {
      symbol: 'aDAI',
      address: '0xA348a2FDB75c8620558b329462c30DBA753A8A79',
      decimals: 6,
      targetUnit: TARGET_UNITS.USD,
      referenceUnit: 'DAI',
      collateralToken: 'aDAI',
      description: 'Used in RSV',
      collateralAddress: '0xA348a2FDB75c8620558b329462c30DBA753A8A79',
      rewardToken: STAKE_AAVE_ADDRESS[CHAIN_ID],
    },
    {
      symbol: 'cDAI',
      address: '0xdc09753894a3F80B8D7EF1D6696ECc7fA3244C21',
      decimals: 6,
      targetUnit: TARGET_UNITS.USD,
      referenceUnit: 'DAI',
      collateralToken: 'cDAI',
      description: 'Used in RSV',
      collateralAddress: '0xdc09753894a3F80B8D7EF1D6696ECc7fA3244C21',
      rewardToken: COMPOUND_ADDRESS[CHAIN_ID],
    },
    {
      symbol: 'cWBTC',
      address: '0xa2fC3a92fDf545B4BC6a7bEE038Ab0e8e05a70a1',
      decimals: 18,
      targetUnit: TARGET_UNITS.BTC,
      referenceUnit: 'WBTC',
      collateralToken: 'cWBTC',
      description: 'Used in RSV',
      collateralAddress: '0xa2fC3a92fDf545B4BC6a7bEE038Ab0e8e05a70a1',
      rewardToken: COMPOUND_ADDRESS[CHAIN_ID],
    },
    {
      symbol: 'cETH',
      address: '0x25d6C3deAe1Fc0530516Bce5459F458f0d7d7086',
      decimals: 18,
      targetUnit: TARGET_UNITS.ETH,
      referenceUnit: 'ETH',
      collateralToken: 'cETH',
      description: 'Used in RSV',
      collateralAddress: '0x25d6C3deAe1Fc0530516Bce5459F458f0d7d7086',
      rewardToken: COMPOUND_ADDRESS[CHAIN_ID],
    },
    {
      symbol: 'wBTC',
      address: '0xaFb62B600377010EC224B5b61973f67d2bACE909',
      decimals: 6,
      targetUnit: TARGET_UNITS.BTC,
      referenceUnit: 'wBTC',
      collateralToken: 'wBTC',
      description: 'Used in RSV',
      collateralAddress: '0xaFb62B600377010EC224B5b61973f67d2bACE909',
      rewardToken: ZERO_ADDRESS,
    },
    {
      symbol: 'EURT',
      address: '0x9fF645a81dF82C6eF09B596bE1736bFbc6B7dA90',
      decimals: 6,
      targetUnit: TARGET_UNITS.EUR,
      referenceUnit: 'EURT',
      collateralToken: 'EURT',
      description: 'Used in RSV',
      collateralAddress: '0x9fF645a81dF82C6eF09B596bE1736bFbc6B7dA90',
      rewardToken: ZERO_ADDRESS,
    },
  ],
}

export default collateralPlugins[CHAIN_ID] || []
