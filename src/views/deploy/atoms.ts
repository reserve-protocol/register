import { atom } from 'jotai'

export interface Collateral {
  symbol: string
  address: string
  targetUnit: string
  custom: boolean
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

export const addBackupCollateralAtom = atom(
  null,
  (get, set, collaterals: Collateral[]) => {}
)

export const addBasketCollateralAtom = atom(
  null,
  (get, set, collaterals: Collateral[]) => {}
)
