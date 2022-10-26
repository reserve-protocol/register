import { Token } from 'types'
import { CHAIN_ID } from 'utils/chains'
import { RSR_ADDRESS } from './addresses'

export const TRANSACTION_STATUS = {
  PENDING: 'PENDING', // Tx to be executed
  SIGNING: 'SIGNING', // signing tx
  MINING: 'MINING', // tx signed and currently mining (can take some time)
  CONFIRMED: 'CONFIRMED', // confirmed (mined) tx
  REJECTED: 'REJECTED', // rejected tx, user canceled or reverted
  UNKNOWN: 'UNKNOWN', // PENDING&SIGNING transactions that were loaded from localStorage
}

export const RTOKEN_STATUS = {
  PAUSED: 'PAUSED',
  FROZEN: 'FROZEN',
  SOUND: 'SOUND',
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
  INSURANCE: '/insurance',
  ISSUANCE: '/issuance',
  STAKING_CALCULATOR: '/staking-calculator',
  AUCTIONS: '/auctions',
  DEPLOY: '/deploy',
  MANAGEMENT: '/management',
  GOVERNANCE: '/management/governance',
  GOVERNANCE_INFO: '/governance-info',
  LIST: '/list',
  HOME: '/',
  WALLET: '/wallet',
  TOKENS: '/tokens',
})

export const DEPLOYMENT_ROUTES = Object.freeze({})

export const isContentOnlyView = (pathname: string) =>
  pathname.indexOf(ROUTES.DEPLOY) !== -1

export const DEPLOY_ROUTES = [ROUTES.DEPLOY]

export const RSR: Token = {
  address: RSR_ADDRESS[CHAIN_ID],
  name: 'Reserve Rights',
  symbol: 'RSR',
  decimals: 18,
  logo: 'rsr.svg',
}
