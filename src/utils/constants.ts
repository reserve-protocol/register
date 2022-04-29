export const TRANSACTION_STATUS = {
  PENDING: 'PENDING', // Tx to be executed
  PENDING_ALLOWANCE: 'PENDING_ALLOWANCE', // For tx waiting for token allowance
  SIGNING: 'SIGNING', // signing tx
  MINING: 'MINING', // tx signed and currently mining (can take some time)
  CONFIRMED: 'CONFIRMED', // confirmed (mined) tx
  REJECTED: 'REJECTED', // rejected tx, user canceled or reverted
  SKIPPED: 'SKIPPED',
}
