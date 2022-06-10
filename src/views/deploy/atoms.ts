import { atom } from 'jotai'

interface Collateral {
  name: string
  address: string
  targetUnit: string
}

interface BackupCollateral {
  [x: string]: {
    diversityFactor: string
    collaterals: Collateral[]
  }
}

interface Basket {
  [x: string]: {
    dirty: false // tracks if the user manually changed weights
    collaterals: Collateral[]
    distribution: number[]
  }
}

export const basketAtom = atom<Basket>({})
export const backupCollateralAtom = atom<BackupCollateral>({})
