export type WizardStep =
  | 'gnosis-check'
  | 'configure'
  | 'collateral-decision'
  | 'token-selection'
  | 'amount-input'
  | 'review'
  | 'quote-summary'
  | 'processing'
  | 'success'

export type MintStrategy = 'partial' | 'single'

export type CollateralAllocation = {
  fromWallet: bigint
  fromSwap: bigint
  usdValue: number
  explanation: string
}
