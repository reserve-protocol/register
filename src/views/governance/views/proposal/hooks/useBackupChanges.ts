import { BackupUnitBasket, BackupBasket } from 'components/rtoken-setup/atoms'
import { backupCollateralAtom, Collateral } from 'components/rtoken-setup/atoms'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { rTokenBackupAtom } from 'state/atoms'
import { StringMap } from 'types'

export interface DiversityFactorChange {
  target: string
  current: number
  proposed: number
}

export interface CollateralChange {
  collateral: Collateral
  isNew: boolean
}

export interface CollateralPriorityChange {
  collateral: Collateral
  current: number
  proposed: number
}

export interface BackupChanges {
  diversityFactor: DiversityFactorChange[]
  collateralChanges: CollateralChange[]
  priorityChanges: CollateralPriorityChange[]
  count: number
}

function parseBackupBasket(basket: BackupUnitBasket): {
  [x: string]: { collateral: Collateral; index: number }
} {
  return basket.collaterals.reduce((prev, current, index) => {
    prev[current.address] = { collateral: current, index }
    return prev
  }, {} as StringMap)
}

/**
 * Listen for form differences with respect of current RToken stored parameters
 */
const useBackupChanges = (): BackupChanges => {
  const backup = useAtomValue(rTokenBackupAtom)
  const proposedBackup = useAtomValue(backupCollateralAtom)
  const [hasRendered, setRendered] = useState(false)

  return useMemo(() => {
    const changes: BackupChanges = {
      collateralChanges: [],
      priorityChanges: [],
      diversityFactor: [],
      count: 0,
    }

    if (!hasRendered) {
      setRendered(true)
      return changes
    }

    if (!Object.keys(backup) && !Object.keys(proposedBackup)) {
      return changes
    }

    const targets = Array.from(
      new Set([...Object.keys(backup), ...Object.keys(proposedBackup)])
    )

    for (const target of targets) {
      const proposedTargetBasket = proposedBackup[target]
      const currentTargetBasket = backup[target]

      if (!proposedTargetBasket || !currentTargetBasket) {
        for (const collateral of proposedTargetBasket?.collaterals ||
          currentTargetBasket?.collaterals) {
          changes.count += 1
          changes.collateralChanges.push({
            collateral,
            isNew: !!proposedTargetBasket,
          })
        }
      } else {
        // Check target diversity factor
        if (
          backup[target].diversityFactor !==
          proposedBackup[target].diversityFactor
        ) {
          changes.count += 1
          changes.diversityFactor.push({
            target,
            current: backup[target].diversityFactor,
            proposed: proposedBackup[target].diversityFactor,
          })
        }

        // Traverse collaterals for changes in priority/additions/deletions
        const proposedBasketCollateralMap = parseBackupBasket(
          proposedBackup[target]
        )
        const currentBasketCollateralMap = parseBackupBasket(backup[target])

        const collateralAddresses = new Set([
          ...Object.keys(proposedBasketCollateralMap),
          ...Object.keys(currentBasketCollateralMap),
        ])

        for (const collateralAddress of Array.from(collateralAddresses)) {
          const proposedCollateral =
            proposedBasketCollateralMap[collateralAddress]
          const currentCollateral =
            currentBasketCollateralMap[collateralAddress]

          if (!currentCollateral && proposedCollateral) {
            changes.count += 1
            changes.collateralChanges.push({
              collateral: proposedCollateral.collateral,
              isNew: true,
            })
          } else if (currentCollateral && !proposedCollateral) {
            changes.count += 1
            changes.collateralChanges.push({
              collateral: currentCollateral.collateral,
              isNew: false,
            })
          } else if (currentCollateral.index !== proposedCollateral.index) {
            changes.count += 1
            changes.priorityChanges.push({
              collateral: currentCollateral.collateral,
              current: currentCollateral.index,
              proposed: proposedCollateral.index,
            })
          }
        }
      }
    }

    return changes
  }, [proposedBackup])
}

export default useBackupChanges
