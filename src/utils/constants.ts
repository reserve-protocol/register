import { Token } from 'types'

export const TRANSACTION_STATUS = {
  PENDING: 'PENDING', // Tx to be executed
  SIGNING: 'SIGNING', // signing tx
  MINING: 'MINING', // tx signed and currently mining (can take some time)
  CONFIRMED: 'CONFIRMED', // confirmed (mined) tx
  REJECTED: 'REJECTED', // rejected tx, user canceled or reverted
  UNKNOWN: 'UNKNOWN', // PENDING&SIGNING transactions that were loaded from localStorage
}

export const COINGECKO_API = 'https://api.coingecko.com/api/v3'

export const ROUTES = Object.freeze({
  OVERVIEW: '/overview',
  INSURANCE: '/insurance',
  ISSUANCE: '/issuance',
  STAKING_CALCULATOR: '/staking-calculator',
  AUCTIONS: '/auctions',
  DEPLOY: '/deploy',
  DEPLOY_SETUP: '/deploy/setup',
  LIST: '/list',
  HOME: '/',
  WALLET: '/wallet',
})

export const isContentOnlyView = (pathname: string) =>
  pathname.indexOf(ROUTES.DEPLOY) !== -1

export const DEPLOY_ROUTES = [ROUTES.DEPLOY, ROUTES.DEPLOY_SETUP]

export const RSR: Token = {
  address: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
  name: 'Reserve Rights',
  symbol: 'RSR',
  decimals: 18,
  logo: 'rsr.png',
}

// tokens used in the rtoken selector screen and dashboard
// TODO: should be fetched, top 5 using market cap
export const DEFAULT_TOKENS = [
  '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
  '0xff4DA0E6C71189814d290564F455C21aeCC66430',
]
