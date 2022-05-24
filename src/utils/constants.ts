import { Token } from 'types'

export const TRANSACTION_STATUS = {
  PENDING: 'PENDING', // Tx to be executed
  SIGNING: 'SIGNING', // signing tx
  MINING: 'MINING', // tx signed and currently mining (can take some time)
  CONFIRMED: 'CONFIRMED', // confirmed (mined) tx
  REJECTED: 'REJECTED', // rejected tx, user canceled or reverted
  SKIPPED: 'SKIPPED',
  UNKNOWN: 'UNKNOWN',
}

export const COINGECKO_API = 'https://api.coingecko.com/api/v3'

export const ROUTES = Object.freeze({
  OVERVIEW: '/overview',
  INSURANCE: '/insurance',
  ISSUANCE: '/issuance',
  EXCHANGE: '/exchange',
  LIST: '/list',
  HOME: '/',
  WALLET: '/wallet',
})

export const RSR: Token = {
  address: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
  name: 'Reserve Rights',
  symbol: 'RSR',
  decimals: 18,
  // TODO: RSR LOGO
  logo: 'rsv.png',
}
