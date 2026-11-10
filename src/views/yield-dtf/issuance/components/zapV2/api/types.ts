import { Address } from 'viem'
import { PriceControl } from '@reserve-protocol/dtf-rebalance-lib'

type FeeRecipientJson = {
  recipient: Address
  portion: string
}

export type GovParamsJson = {
  optimisticParams: {
    vetoDelay: string
    vetoPeriod: string
    vetoThreshold: string
  }
  standardParams: {
    votingDelay: string
    votingPeriod: string
    voteExtension: string
    proposalThreshold: string
    quorumNumerator: string
  }
  optimisticSelectors: `0x${string}`[]
  optimisticProposers: Address[]
  additionalGuardians: Address[]
  timelockDelay: string
  proposalThrottleCapacity: string
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
    maxAuctionLength: string
    feeRecipients: FeeRecipientJson[]
    immutableFeeRecipients: FeeRecipientJson[]
    tvlFee: string
    mintFee: string
    folioFeeForSelf: string
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
  bidsEnabled: boolean
}

export interface ZapDeployBody extends BaseZapDeployBody {
  stToken: Address
  govParams: GovParamsJson
}

export interface ZapDeployUngovernedBody extends BaseZapDeployBody {
  owner: Address
}
