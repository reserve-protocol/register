import { Address } from 'viem'
import { PriceControl } from '@reserve-protocol/dtf-rebalance-lib'

export type GovParamsJson = {
  votingDelay: string
  votingPeriod: string
  proposalThreshold: string
  quorumThreshold: string
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
    auctionLength: string
    feeRecipients: {
      recipient: Address
      portion: string
    }[]
    tvlFee: string
    mintFee: string
    mandate: string
  }
  folioFlags: FolioFlags
  basketManagers: Address[]
  auctionLaunchers: Address[]
  brandManagers: Address[]
}

export interface FolioFlags {
  trustedFillerEnabled: boolean
  rebalanceControl: {
    weightControl: boolean
    priceControl: PriceControl
  }
}

export interface ZapDeployBody extends BaseZapDeployBody {
  stToken: Address
  ownerGovParams: GovParamsJson
  tradingGovParams: GovParamsJson
}

export interface ZapDeployUngovernedBody extends BaseZapDeployBody {
  owner: Address
}
