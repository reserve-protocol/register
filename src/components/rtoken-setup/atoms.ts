import { atomWithReset } from 'jotai/utils'
import { t } from '@lingui/macro'
import { atom } from 'jotai'
import { isAddress, truncateDecimals } from 'utils'
import { CollateralPlugin } from 'types'

export interface Collateral {
  symbol: string
  address: string
  targetUnit: string
  rewardToken?: string[]
  collateralAddress?: string
  custom?: boolean
}

export interface BackupUnitBasket {
  diversityFactor: number
  collaterals: Collateral[]
}

export interface BackupBasket {
  [x: string]: BackupUnitBasket
}

export interface PrimaryUnitBasket {
  scale: string
  collaterals: Collateral[]
  distribution: string[]
}

export interface Basket {
  [x: string]: PrimaryUnitBasket
}

export interface ExternalAddressSplit {
  address: string
  total: string
  holders: string
  stakers: string
}

export interface RevenueSplit {
  holders: string
  stakers: string
  external: ExternalAddressSplit[]
}

/**
 * State atoms
 */
export const basketAtom = atomWithReset<Basket>({})
export const backupCollateralAtom = atomWithReset<BackupBasket>({})
export const revenueSplitAtom = atomWithReset<RevenueSplit>({
  holders: '60', // %
  stakers: '40', // %
  external: [],
})
//

export const isBasketValidAtom = atom((get) => {
  return !!Object.keys(get(basketAtom)).length
})

export const getCollateralFromBasket = (basket: Basket | BackupBasket) => {
  return Object.values(basket).reduce(
    (acc, { collaterals }) => [
      ...acc,
      ...collaterals.map((c: any) => c.address),
    ],
    [] as string[]
  )
}

// TODO: Confirm change
// {
//   symbol: collateral.symbol,
//   address: collateral?.depositContract || collateral.collateralAddress,
//   collateralAddress: collateral.address,
//   targetUnit: collateral.targetUnit,
// },
const getCollateralByTarget = (collaterals: CollateralPlugin[]) => {
  return collaterals.reduce((acc, collateral) => {
    acc[collateral.targetUnit] = [
      ...(acc[collateral.targetUnit] ?? []),
      collateral,
    ]

    return acc
  }, {} as { [x: string]: Collateral[] })
}

export const isValidBasketAtom = atom((get): [boolean, string[]] => {
  const basket = get(basketAtom)
  const backup = get(backupCollateralAtom)
  const errors: string[] = []

  const units = Object.keys(basket)

  if (!units.length) {
    errors.push(t`Primary basket not defined`)
  }

  for (const targetUnit of units) {
    const distribution = basket[targetUnit].distribution.reduce(
      (acc, n) => acc + Number(n),
      0
    )
    if (distribution !== 100) {
      errors.push(t`Invalid (${targetUnit}) basket distribution`)
    }

    if (Number(basket[targetUnit].scale) <= 0) {
      errors.push(t`Invalid (${targetUnit}) basket scale`)
    }

    if (backup[targetUnit]) {
      const { diversityFactor } = backup[targetUnit]
      const collaterals = backup[targetUnit].collaterals.length

      if (
        collaterals &&
        (diversityFactor > collaterals || diversityFactor <= 0)
      ) {
        errors.push(t`Invalid (${targetUnit}) backup diversity factor`)
      }
    }
  }

  return [!errors.length, errors]
})

export const primaryBasketCollateralAtom = atom((get) => {
  return getCollateralFromBasket(get(basketAtom))
})

export const backupBasketCollateralAtom = atom((get) => {
  return getCollateralFromBasket(get(backupCollateralAtom))
})

export const addBackupCollateralAtom = atom(
  null,
  (get, set, collaterals: CollateralPlugin[]) => {
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
  (get, set, collaterals: CollateralPlugin[]) => {
    const basket = { ...get(basketAtom) }
    const collateralByTarget = getCollateralByTarget(collaterals)

    for (const unit of Object.keys(collateralByTarget)) {
      const unitCollaterals = [
        ...collateralByTarget[unit],
        ...(basket[unit]?.collaterals ?? []),
      ]

      const distribution = new Array(unitCollaterals.length - 1).fill(
        truncateDecimals(100 / unitCollaterals.length)
      )
      const sum = distribution.reduce((a, b) => a + b, 0)
      distribution.push(100 - sum)

      basket[unit] = {
        collaterals: unitCollaterals,
        distribution,
        scale: basket[unit]?.scale ?? '1',
      }
    }

    set(basketAtom, basket)
  }
)

export const updateBackupBasketUnitAtom = atom(
  null,
  (get, set, [unit, data]: [string, BackupUnitBasket]) => {
    const basket = { ...get(backupCollateralAtom) }

    if (!data.collaterals.length) {
      delete basket[unit]
    } else {
      basket[unit] = { ...basket[unit], ...data }
    }

    set(backupCollateralAtom, basket)
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

// The sum of all allocations should be 100%
// Multiply by 10 to avoid floating point precision issues (only 1 decimal allowed)
export const isRevenueValidAtom = atom((get) => {
  const revenue = get(revenueSplitAtom)
  let total = 0

  for (const external of revenue.external) {
    // Validate internal address allocation
    if (+external.holders * 10 + +external.stakers * 10 !== 1000) {
      return false
    }

    total += +external.total * 10
  }

  const sum = +revenue.stakers * 10 + +revenue.holders * 10 + total

  if (sum !== 1000) {
    return false
  }

  return true
})

export const isValidExternalMapAtom = atom((get) => {
  const { external } = get(revenueSplitAtom)

  for (const { address } of external) {
    if (!isAddress(address)) {
      return false
    }
  }

  return true
})
