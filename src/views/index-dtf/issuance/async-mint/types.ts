import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

export type WizardStep =
  | 'gnosis-check'
  | 'operation-select'
  | 'collateral-decision'
  | 'token-selection'
  | 'amount-input'
  | 'review'
  | 'quote-summary'
  | 'processing'
  | 'recovery-options'
  | 'success'

export type MintStrategy = 'partial' | 'single'

export type RecoveryChoice = 'top-up' | 'mint-reduced' | 'cancel' | null

export type QuoteResult =
  | { success: true; data: OrderQuoteResponse }
  | { success: false; error?: string }

export type CollateralAllocation = {
  fromWallet: bigint
  fromSwap: bigint
  usdValue: number
  explanation: string
}
