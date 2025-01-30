import { Address } from 'viem'

export type GovParamsJson = {
  votingDelay: string
  votingPeriod: string
  proposalThreshold: string
  quorumPercent: string
  timelockDelay: string
  guardian?: Address
}

export interface ZapDeployBody {
  tokenIn: Address
  amountIn: string
  signer: Address
  slippage?: number // default value => 0.001 or 0.1%
  recipient?: Address // defaults to signer
  dustRecipient?: Address // defaults to recipient

  stToken: Address
  basicDetails: {
    // token quantities pr 1 share of output
    assets: Address[]
    amounts: string[]
    name: string
    symbol: string
  }
  additionalDetails: {
    tradeDelay: string
    auctionLength: string
    feeRecipients: {
      recipient: Address
      portion: string
    }[]
    folioFee: string
    mintingFee: string
  }
  ownerGovParams: GovParamsJson
  tradingGovParams: GovParamsJson
  existingTradeProposers: Address[]
  tradeLaunchers: Address[]
  vibesOfficers: Address[]
}

export interface ZapDeployUngovernedBody {
  tokenIn: Address
  amountIn: string
  signer: Address
  slippage?: number // default value => 0.001 or 0.1%
  recipient?: Address // defaults to signer
  dustRecipient?: Address // defaults to recipient

  owner: Address
  basicDetails: {
    // token quantities pr 1 share of output
    assets: Address[]
    amounts: string[]
    name: string
    symbol: string
  }
  additionalDetails: {
    tradeDelay: string
    auctionLength: string
    feeRecipients: {
      recipient: Address
      portion: string
    }[]
    folioFee: string
    mintingFee: string
  }
  existingTradeProposers: Address[]
  tradeLaunchers: Address[]
  vibesOfficers: Address[]
}
