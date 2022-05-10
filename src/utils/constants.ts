export const TRANSACTION_STATUS = {
  PENDING: 'PENDING', // Tx to be executed
  SIGNING: 'SIGNING', // signing tx
  MINING: 'MINING', // tx signed and currently mining (can take some time)
  CONFIRMED: 'CONFIRMED', // confirmed (mined) tx
  REJECTED: 'REJECTED', // rejected tx, user canceled or reverted
  SKIPPED: 'SKIPPED',
}

export const COINGECKO_API = 'https://api.coingecko.com/api/v3'
