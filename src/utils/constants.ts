import { Token } from 'types'
import { RSR_ADDRESS } from './addresses'
import { ChainId } from './chains'
import rtokens from '@lc-labs/rtokens'
import RSV from './rsv'

export const VERSION = '3.0.0'

export const DISCORD_INVITE = 'https://discord.com/invite/M4BafXtTNz'
export const PROTOCOL_DOCS = 'https://reserve.org/protocol/'
export const REGISTER_FEEDBACK = 'https://reserve.canny.io/register-app'

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
}

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
  OVERVIEW: '/overview',
  STAKING: '/staking',
  ISSUANCE: '/issuance',
  STAKING_CALCULATOR: '/staking-calculator',
  AUCTIONS: '/auctions',
  DEPLOY: '/deploy',
  SETTINGS: '/settings',
  GOVERNANCE_SETUP: '/management/governance',
  GOVERNANCE_INFO: '/governance-info',
  LIST: '/list',
  HOME: '/',
  WALLET: '/wallet',
  TOKENS: '/tokens',
  GOVERNANCE: '/governance',
  GOVERNANCE_PROPOSAL: '/governance/proposal',
  ZAP: '/zap',
  BRIDGE: '/bridge',
  PORTFOLIO: '/portfolio',
  EARN: '/earn',
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
}

export const supportedChainList = [ChainId.Mainnet, ChainId.Base]
export const CHAIN_TAGS = {
  [ChainId.Mainnet]: 'Ethereum',
  [ChainId.Base]: 'Base',
}

export const LISTED_RTOKEN_ADDRESSES: { [x: number]: string[] } = {
  [ChainId.Mainnet]: [RSV.address.toLowerCase()],
}

for (const chain of supportedChainList) {
  LISTED_RTOKEN_ADDRESSES[chain] = [
    ...Object.keys(rtokens[chain]).map((s) => s.toLowerCase()),
  ]
}
