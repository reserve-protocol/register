import { BigNumber } from 'ethers'
import { Token } from 'types'
import { CHAIN_ID } from 'utils/chains'
import { RSR_ADDRESS } from './addresses'

export const BI_ZERO = BigNumber.from(0)

export const BLOCK_DELAY = 12 // 12 seconds per block

export const COLLATERAL_STATUS = {
  SOUND: 0,
  IFFY: 1,
  DEFAULT: 2,
}

// Register transaction status
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING', // Tx to be executed
  SIGNING: 'SIGNING', // signing tx
  MINING: 'MINING', // tx signed and currently mining (can take some time)
  CONFIRMED: 'CONFIRMED', // confirmed (mined) tx
  REJECTED: 'REJECTED', // rejected tx, user canceled or reverted
  UNKNOWN: 'UNKNOWN', // PENDING&SIGNING transactions that were loaded from localStorage
}

// Governance proposal states
export const PROPOSAL_STATES = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  DEFEATED: 'DEFEATED',
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
}

export const COINGECKO_API = 'https://api.coingecko.com/api/v3'

export const TIME_RANGES = {
  DAY: '24h',
  WEEK: '7d',
  MONTH: '30d',
}

export const TIME_RANGE_VALUE: { [x: string]: number } = {
  [TIME_RANGES.DAY]: 86400,
  [TIME_RANGES.WEEK]: 604800,
  [TIME_RANGES.MONTH]: 2592000,
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
})

export const DEPLOYMENT_ROUTES = Object.freeze({})

export const isContentOnlyView = (pathname: string) =>
  pathname.indexOf(ROUTES.DEPLOY) !== -1 ||
  pathname.toLowerCase() === ROUTES.GOVERNANCE

export const DEPLOY_ROUTES = [ROUTES.DEPLOY]

export const RSR: Token = {
  address: RSR_ADDRESS[CHAIN_ID],
  name: 'Reserve Rights',
  symbol: 'RSR',
  decimals: 18,
  logo: 'rsr.svg',
}

export const PROTOCOL_SLUG = 'reserveprotocol-v1'
