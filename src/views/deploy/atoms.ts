import { atom } from 'jotai'

export interface Collateral {
  name: string
  address: string
  targetUnit: string
}

export interface BackupCollateral {
  [x: string]: {
    diversityFactor: string
    collaterals: Collateral[]
  }
}

export interface Basket {
  [x: string]: {
    dirty: false // tracks if the user manually changed weights
    collaterals: Collateral[]
    distribution: number[]
  }
}

export const basketAtom = atom<Basket>({})
export const backupCollateralAtom = atom<BackupCollateral>({})
export const isBasketValidAtom = atom((get) => {
  return !!Object.keys(get(basketAtom)).length
})
