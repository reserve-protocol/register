import { atom } from 'jotai'

export interface Collateral {
  symbol: string
  address: string
  targetUnit: string
  custom?: boolean
}

export interface BackupCollateral {
  [x: string]: {
    diversityFactor: string
    collaterals: Collateral[]
  }
}

export interface PrimaryUnitBasket {
  scale: string
  collaterals: Collateral[]
  distribution: string[]
}

export interface Basket {
  [x: string]: PrimaryUnitBasket
}

export const basketAtom = atom<Basket>({})
export const backupCollateralAtom = atom<BackupCollateral>({})
export const isBasketValidAtom = atom((get) => {
  return !!Object.keys(get(basketAtom)).length
})

const getCollateralFromBasket = (basket: Basket | BackupCollateral) => {
  return Object.values(basket).reduce(
    (acc, { collaterals }) => [
      ...acc,
      ...collaterals.map((c: any) => c.address),
    ],
    [] as string[]
  )
}

const getCollateralByTarget = (collaterals: Collateral[]) => {
  return collaterals.reduce((acc, collateral) => {
    acc[collateral.targetUnit] = [
      ...(acc[collateral.targetUnit] ?? []),
      collateral,
    ]

    return acc
  }, {} as { [x: string]: Collateral[] })
}

export const primaryBasketCollateralAtom = atom((get) => {
  return getCollateralFromBasket(get(basketAtom))
})

export const backupBasketCollateralAtom = atom((get) => {
  return getCollateralFromBasket(get(backupCollateralAtom))
})

export const addBackupCollateralAtom = atom(
  null,
  (get, set, collaterals: Collateral[]) => {
    const basket = { ...get(backupCollateralAtom) }
    const collateralByTarget = getCollateralByTarget(collaterals)

    for (const unit of Object.keys(collateralByTarget)) {
      const unitCollaterals = [
        ...collateralByTarget[unit],
        ...(basket[unit]?.collaterals ?? []),
      ]

      basket[unit] = {
        collaterals: unitCollaterals,
        diversityFactor:
          basket[unit]?.diversityFactor ?? Math.min(3, unitCollaterals.length),
      }
    }

    set(backupCollateralAtom, basket)
  }
)

export const addBasketCollateralAtom = atom(
  null,
  (get, set, collaterals: Collateral[]) => {
    const basket = { ...get(basketAtom) }
    const collateralByTarget = getCollateralByTarget(collaterals)

    for (const unit of Object.keys(collateralByTarget)) {
      const unitCollaterals = [
        ...collateralByTarget[unit],
        ...(basket[unit]?.collaterals ?? []),
      ]

      const distribution = new Array(unitCollaterals.length).fill(
        100 / unitCollaterals.length
      )

      basket[unit] = {
        collaterals: unitCollaterals,
        distribution,
        scale: basket[unit]?.scale ?? 1,
      }
    }

    set(basketAtom, basket)
  }
)

export const updateBasketUnitAtom = atom(
  null,
  (get, set, [unit, data]: [string, PrimaryUnitBasket]) => {
    const basket = { ...get(basketAtom) }

    if (!data.collaterals.length) {
      delete basket[unit]
      const backup = { ...get(backupCollateralAtom) }
      delete backup[unit]
      set(backupCollateralAtom, backup)
    } else {
      basket[unit] = { ...basket[unit], ...data }
    }

    set(basketAtom, basket)
  }
)
