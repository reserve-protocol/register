import { Token, Trader } from 'types'
import {
  ETHPLUS_ADDRESS,
  EUSD_ADDRESS,
  RGUSD_ADDRESS,
  RSR_ADDRESS,
  USD3_ADDRESS,
} from './addresses'
import { ChainId } from './chains'
import rtokens from '@reserve-protocol/rtokens'
import RSV from './rsv'

export const VERSION = '3.0.0'

export const DISCORD_INVITE = 'https://discord.gg/reserveprotocol'
export const PROTOCOL_DOCS = 'https://reserve.org/protocol/'
export const REGISTER_FEEDBACK = 'https://reserve.canny.io/register-app'
export const REGISTER_BUGS =
  'https://reserve.canny.io/defi-surfaces-bug-reporting'

export const DIVA_SAFE_POOLS = [
  '57d5dc30-8ade-4f40-87d2-6065297d0705',
  '5f83ac83-753a-4382-869f-38c4e1658a36',
  '91ec3f5f-587c-4a26-9a98-1593ed9bab26'
]

export const LP_PROJECTS: { [x: string]: { name: string; site: string } } = {
  'curve-dex': {
    name: 'Curve',
    site: 'https://curve.fi/#/ethereum/pools',
  },
  'convex-finance': {
    name: 'Convex',
    site: 'https://www.convexfinance.com/stake',
  },
  'yearn-finance': {
    name: 'Yearn',
    site: 'https://yearn.fi/vaults',
  },
  stakedao: {
    name: 'StakeDAO',
    site: 'https://www.stakedao.org/yield',
  },
  'uniswap-v3': {
    name: 'Uniswap',
    site: 'https://app.uniswap.org/',
  },
  'balancer-v2': {
    name: 'Balancer',
    site: 'https://app.balancer.fi/',
  },
  'extra-finance': {
    name: 'Extra Finance',
    site: 'https://app.extrafi.io/lend',
  },
  'aerodrome-v1': {
    name: 'Aerodrome',
    site: 'https://aerodrome.finance/',
  },
  beefy: {
    name: 'Beefy',
    site: 'https://app.beefy.finance/',
  },
  concentrator: {
    name: 'Concentrator',
    site: 'https://concentrator.aladdin.club/',
  },
  dyson: {
    name: 'Dyson',
    site: 'https://app.dyson.money/',
  },
  'camelot-v3': {
    name: 'Camelot',
    site: 'https://app.camelot.exchange/',
  },
}

// List of supported networks with label
export const NETWORKS: Record<string, number> = {
  ethereum: ChainId.Mainnet,
  base: ChainId.Base,
  arbitrum: ChainId.Arbitrum,
}

export const CHAIN_TO_NETWORK = Object.entries(NETWORKS).reduce(
  (acc, [network, chainId]) => {
    acc[chainId] = network
    return acc
  },
  {} as Record<number, string>
)

export const BIGINT_MAX =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n

export const COLLATERAL_STATUS = {
  SOUND: 0,
  IFFY: 1,
  DEFAULT: 2,
}

// Governance proposal states
export const PROPOSAL_STATES = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  DEFEATED: 'DEFEATED',
  QUORUM_NOT_REACHED: 'QUORUM_NOT_REACHED',
  SUCCEEDED: 'SUCCEEDED',
  QUEUED: 'QUEUED',
  EXPIRED: 'EXPIRED',
  EXECUTED: 'EXECUTED',
}

// Supported collateral plugins target unit
export const TARGET_UNITS = {
  USD: 'USD',
  EUR: 'EUR',
  ETH: 'ETH',
  BTC: 'BTC',
  TRICRYPTO: 'TRICRYPTOLP',
}

export const TIME_RANGES = {
  DAY: '24h',
  WEEK: '7d',
  MONTH: '30d',
  YEAR: '1y',
}

export const TIME_RANGE_VALUE: { [x: string]: number } = {
  [TIME_RANGES.DAY]: 86400,
  [TIME_RANGES.WEEK]: 604800,
  [TIME_RANGES.MONTH]: 2592000,
  [TIME_RANGES.YEAR]: 31104000,
}

export const ROUTES = Object.freeze({
  OVERVIEW: 'overview',
  STAKING: 'staking',
  ISSUANCE: 'issuance',
  AUCTIONS: 'auctions',
  DEPLOY: '/deploy',
  SETTINGS: 'settings',
  GOVERNANCE_SETUP: 'governance/setup',
  GOVERNANCE_INFO: 'governance-info',
  LIST: 'list',
  HOME: '/',
  COMPARE: '/compare',
  WALLET: '/wallet',
  TOKENS: '/tokens',
  GOVERNANCE: 'governance',
  GOVERNANCE_PROPOSAL: 'governance/proposal',
  ZAP: '/zap',
  BRIDGE: '/bridge',
  PORTFOLIO: '/portfolio',
  EARN: '/earn',
  NOT_FOUND: '/404',
  EXPLORER: '/explorer',
  EXPLORER_TOKENS: '/explorer/tokens',
  EXPLORER_COLLATERALS: 'collaterals',
  EXPLORER_GOVERNANCE: '/explorer/governance',
  EXPLORER_TRANSACTIONS: 'transactions',
})

export const RSR: Token = {
  address: RSR_ADDRESS[ChainId.Mainnet],
  name: 'Reserve Rights',
  symbol: 'RSR',
  decimals: 18,
}

export const PROTOCOL_SLUG = 'reserveprotocol-v1'

export const capitalize = (str: string) =>
  str.slice(0, 1).toUpperCase() + str.slice(1)

export const formatConstant = (str: string) =>
  capitalize(str.toLowerCase().replaceAll('_', ' '))

export const blockDuration = {
  [ChainId.Mainnet]: 12,
  [ChainId.Base]: 2,
  [ChainId.Arbitrum]: 1,
}
export const supportedChainList = [
  ChainId.Mainnet,
  ChainId.Base,
  ChainId.Arbitrum,
]

// Load environment variables.
export const TENDERLY_ACCESS_TOKEN: string = import.meta.env
  .VITE_TENDERLY_ACCESS_TOKEN!
export const TENDERLY_USER: string = import.meta.env.VITE_TENDERLY_USER!
export const TENDERLY_PROJECT_SLUG: string = import.meta.env
  .VITE_TENDERLY_PROJECT_SLUG!

// Tenderly simulation
export const BLOCK_GAS_LIMIT = 30_000_000
export const DEFAULT_FROM = '0xD73a92Be73EfbFcF3854433A5FcbAbF9c1316073' // arbitrary EOA not used on-chain
export const TENDERLY_BASE_URL = `https://api.tenderly.co/api/v1`
export const TENDERLY_ENCODE_URL = `${TENDERLY_BASE_URL}/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT_SLUG}/contracts/encode-states`
export const TENDERLY_SIM_URL = `${TENDERLY_BASE_URL}/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT_SLUG}/simulate`
export const TENDERLY_SHARE_URL = (id: string) =>
  `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT_SLUG}/simulations/${id}/share`
export const TENDERLY_SHARING_URL = (id: string) =>
  `https://dashboard.tenderly.co/shared/simulation/${id}`

export const CHAIN_TAGS = {
  [ChainId.Mainnet]: 'Ethereum',
  [ChainId.Base]: 'Base',
  [ChainId.Arbitrum]: 'Arbitrum One',
}

export const LISTED_RTOKEN_ADDRESSES: { [x: number]: string[] } = {
  [ChainId.Mainnet]: [RSV.address.toLowerCase()],
}

export const BRIDGED_RTOKENS = {
  [ChainId.Mainnet]: {
    [EUSD_ADDRESS[ChainId.Mainnet]]: [
      {
        address: EUSD_ADDRESS[ChainId.Base],
        chain: ChainId.Base,
      },
      {
        address: EUSD_ADDRESS[ChainId.Arbitrum],
        chain: ChainId.Arbitrum,
      },
    ],
    [ETHPLUS_ADDRESS[ChainId.Mainnet]]: [
      {
        address: ETHPLUS_ADDRESS[ChainId.Arbitrum],
        chain: ChainId.Arbitrum,
      },
    ],
    [RGUSD_ADDRESS[ChainId.Mainnet]]: [
      {
        address: RGUSD_ADDRESS[ChainId.Base],
        chain: ChainId.Base,
      },
      {
        address: RGUSD_ADDRESS[ChainId.Arbitrum],
        chain: ChainId.Arbitrum,
      },
    ],
    [USD3_ADDRESS[ChainId.Mainnet]]: [
      {
        address: USD3_ADDRESS[ChainId.Base],
        chain: ChainId.Base,
      },
    ],
  },
}

export const BRIDGE_RTOKEN_MAP = Object.entries(
  BRIDGED_RTOKENS[ChainId.Mainnet]
).reduce((acc, [key, tokens]) => {
  for (const token of tokens) {
    acc[token.address] = key
  }

  return acc
}, {} as Record<string, string>)

for (const chain of supportedChainList) {
  LISTED_RTOKEN_ADDRESSES[chain] = [
    ...Object.keys(rtokens[chain] || {}).map((s) => s.toLowerCase()),
  ]
}

export const TRADERS: Trader[] = ['backingManager', 'rsrTrader', 'rTokenTrader']

export const TraderLabels: Record<Trader, string> = {
  backingManager: 'Backing Manager',
  rsrTrader: 'RSR Trader',
  rTokenTrader: 'RToken Trader',
}

export const collateralDisplay: Record<string, string> = {
  sadai: 'AAVE DAI',
  sausdc: 'AAVE USDC',
  sausdt: 'AAVE USDT',
  sabusd: 'AAVE BUSD',
  sausdp: 'AAVE USDP',
  cdai: 'Compound DAI',
  cusdc: 'Compound USDC',
  cusdt: 'Compound USDT',
  cusdp: 'Compound USDP',
  cwbtc: 'Compound WBTC',
  ceth: 'Compound ETH',
  reth: 'Rocket Pool ETH',
  weth: 'Wrapped ETH',
  wsteth: 'Wrapped Staked ETH',
  fusdc: 'Flux USDC',
  fusdt: 'Flux USDT',
  fdai: 'Flux DAI',
  ffrax: 'Flux FRAX',
  wcusdcv3: 'Compound USDC V3',
  wcusdbcv3: 'Compound USDbC V3',
  stkcvx3crv: 'Convex DAI/USDC/USDT',
  'stkcvxeusd3crv-f': 'Convex eUSD/FRAXBP',
  'stkcvxmim-3lp3crv-f': 'Convex MIM/3CRV',
  ws3crv: 'Curve DAI/USDC/USDT',
  weusdfraxbp: 'Curve eUSD/FRAXBP',
  wmim3crv: 'Curve MIM/3CRV',
  sdai: 'Savings DAI',
  cbeth: 'Coinbase ETH',
  'mrp-ausdt': 'Morpho AAVE USDT',
  'mrp-ausdc': 'Morpho AAVE USDC',
  'mrp-adai': 'Morpho AAVE DAI',
  'mrp-awbtc': 'Morpho AAVE WBTC',
  'mrp-aweth': 'Morpho AAVE WETH',
  'mrp-asteth': 'Morpho AAVE Staked ETH',
  sabasusdbc: 'AAVE Base USDbC',
  wsgusdbc: 'Stargate Base USDbC',
  saethusdc: 'AAVE USDC V3',
  stkcvxpyusdusdc: 'Convex PYUSD/USDC',
  saethpyusd: 'AAVE PYUSD V3',
  sabasusdc: 'AAVE USDC V3',
  sfrxeth: 'Staked Frax ETH',
  re7weth: 'Morpho Blue Re7 WETH Vault',
  'stkcvxcrvusdusdt-f': ' Convex crvUSD/USDT',
  'stkcvxcrvusdusdc-f': 'Convex crvUSD/USDC',
  steakpyusd: 'Morpho Blue pyUSD',
  bbusdt: 'Morpho Blue USDT',
  steakusdc: 'Morpho Blue USDC',
  saarbusdcn: 'AAVE USDC V3',
  saarbusdt: 'AAVE USDT V3',
  'stkcvxeth+eth-f': 'Convex ETH+/ETH',
}
