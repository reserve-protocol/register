import { RTokenAsset } from 'state/rtoken/atoms/rTokenAssetsAtom'
import { Address } from 'viem'

export interface Claimable {
  asset: RTokenAsset
  amount: number
  amountUsd: number
  rsrTrader: number
  rTokenTrader: number
  backingManager: number
}

export interface TraderEmissions {
  total: number
  tokens: {
    amount: number
    symbol: string
    address: Address
  }[]
}

export interface ClaimEmissionMap {
  rsrTrader: boolean
  backingManager: boolean
  rTokenTrader: boolean
}
