import { RTokenAsset } from 'state/rtoken/atoms/rTokenAssetsAtom'

export interface Claimable {
  asset: RTokenAsset
  amount: number
  amountUsd: number
  rsrTrader: number
  rTokenTrader: number
  backingManager: number
}

export interface ClaimEmissionMap {
  rsrTrader: boolean
  backingManager: boolean
  rTokenTrader: boolean
}
