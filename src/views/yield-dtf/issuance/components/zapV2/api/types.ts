import { Address } from 'viem'

export type GovParamsJson = {
  votingDelay: string
  votingPeriod: string
  proposalThreshold: string
  quorumPercent: string
  timelockDelay: string
  guardians: Address[]
}

interface BaseZapDeployBody {
  tokenIn: Address
  amountIn: string
  signer: Address
  slippage?: number // default value => 0.001 or 0.1%
  recipient?: Address // defaults to signer
  dustRecipient?: Address // defaults to recipient

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
    mandate: string
  }

  tradeLaunchers: Address[]
  vibesOfficers: Address[]
  existingAuctionApprovers: Address[]
}

export interface ZapDeployBody extends BaseZapDeployBody {
  stToken: Address
  ownerGovParams: GovParamsJson
  tradingGovParams: GovParamsJson
}

export interface ZapDeployUngovernedBody extends BaseZapDeployBody {
  owner: Address
}
