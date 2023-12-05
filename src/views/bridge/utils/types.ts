export type WithdrawalMessage = {
  nonce: bigint
  sender: `0x${string}`
  target: `0x${string}`
  value: bigint
  gasLimit: bigint
  data: `0x${string}`
}

export type WithdrawalPhase =
  | 'PROPOSING_ON_CHAIN'
  | 'PROVE'
  | 'PROVE_TX_PENDING'
  | 'PROVE_TX_FAILURE'
  | 'CHALLENGE_WINDOW'
  | 'FINALIZE'
  | 'FINALIZE_TX_PENDING'
  | 'FINALIZE_TX_FAILURE'
  | 'FUNDS_WITHDRAWN'
