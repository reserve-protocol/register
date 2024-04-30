import { t } from '@lingui/macro'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import {
  chainIdAtom,
  rTokenAssetsAtom,
  secondsPerBlockAtom,
  selectedRTokenAtom,
} from 'state/atoms'
import { CollateralPlugin } from 'types'
import { isAddress, truncateDecimals } from 'utils'
import { RSR_ADDRESS } from 'utils/addresses'
import collateralPlugins from 'utils/plugins'
import { Address, parseEther } from 'viem'

export interface Collateral {
  symbol: string
  address: Address
  targetName: string
  rewardTokens?: Address[]
  erc20: Address // asset erc20 address
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
// TODO: This may not be needed?
const getCollateralByTarget = (collaterals: CollateralPlugin[]) => {
  return collaterals.reduce((acc, collateral) => {
    acc[collateral.targetName] = [
      ...(acc[collateral.targetName] ?? []),
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

export const rtokenAllActiveCollateralsAtom = atom((get) => {
  const primaryBasketCollaterals = get(primaryBasketCollateralAtom)
  const backupBasketCollaterals = get(backupBasketCollateralAtom)
  const rToken = get(selectedRTokenAtom)
  const allAssets = get(rTokenAssetsAtom)

  const plugins = collateralPlugins[get(chainIdAtom)]

  const basketCollaterals = [
    ...primaryBasketCollaterals,
    ...backupBasketCollaterals,
  ]

  const systemAssets: string[] = []
  Object.entries(allAssets || {}).forEach(([erc20, asset]) => {
    if (
      erc20.toLowerCase() === RSR_ADDRESS[get(chainIdAtom)].toLowerCase() ||
      erc20.toLowerCase() === rToken?.toLowerCase()
    )
      systemAssets.push(asset.address)
  })
  const rewardTokenCollaterals = basketCollaterals.reduce(
    (acc, collAddr: string) => [
      ...acc,
      ...(plugins.find(
        (p) => p.address.toLowerCase() === collAddr.toLowerCase()
      )?.rewardTokens || []),
    ],
    [] as string[]
  )

  return [...basketCollaterals, ...rewardTokenCollaterals, ...systemAssets]
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

export const setupRolesAtom = atomWithReset({
  pausers: [] as Address[],
  shortFreezers: [] as Address[],
  longFreezers: [] as Address[],
})

export const timeToBlocks = (seconds: number, secondsPerBlock = 12): number => {
  return seconds / secondsPerBlock
}

export const governanceDefaultValues = {
  defaultGovernance: true,
  unpause: '0',
  votingDelay: '48', // 2 days
  votingPeriod: '72', // 3 days
  proposalThresholdAsMicroPercent: '0.01', // 0.01%
  quorumPercent: '10', // 10%
  minDelay: '72', // 72 hours -> 86400
  guardian: '',
  pauser: '',
  owner: '',
}

export const rTokenDefaultValues = {
  // token params
  name: '',
  symbol: '',
  manifesto: '',
  ownerAddress: '',
  reweightable: false,
  // backing params
  tradingDelay: '0',
  batchAuctionLength: '900',
  dutchAuctionLength: '1800',
  backingBuffer: '0.1', // 0.1%
  maxTradeSlippage: '0.5', // 0.5%
  issuanceThrottleAmount: '2000000', // Anticipated redemption minimum amount for throttling
  issuanceThrottleRate: '10', // 10% per hour
  redemptionThrottleAmount: '2500000',
  redemptionThrottleRate: '12.5',
  // other
  rewardRatio: '0.0000011460766875',
  unstakingDelay: '1209600',
  minTrade: '1000',
  maxTrade: '1000000',
  shortFreeze: '259200', // 3 days
  longFreeze: '604800', // 1 week
  withdrawalLeak: '5', // 5%
  warmupPeriod: '900', // 15minutes
  // governance
  ...governanceDefaultValues,
}
