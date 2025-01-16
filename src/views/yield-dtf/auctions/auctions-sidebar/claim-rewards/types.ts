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

export interface RewardTokenWithCollaterals {
  amount: number
  symbol: string
  address: Address
  collaterals: Address[]
}

export interface TraderEmissions {
  total: number
  tokens: RewardTokenWithCollaterals[]
}

export interface ClaimEmissionMap {
  rsrTrader: boolean
  backingManager: boolean
  rTokenTrader: boolean
}
