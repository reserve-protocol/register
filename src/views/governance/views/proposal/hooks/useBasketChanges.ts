import {
  basketAtom,
  Collateral,
  PrimaryUnitBasket,
} from 'components/rtoken-setup/atoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rTokenBasketAtom } from 'state/atoms'
import { StringMap } from 'types'
import { isNewBasketProposedAtom } from '../atoms'
import { CollateralChange } from './useBackupChanges'

function parseBasket(basket: PrimaryUnitBasket): {
  [x: string]: { collateral: Collateral; index: number }
} {
  return (basket?.collaterals ?? []).reduce((prev, current, index) => {
    prev[current.address] = { collateral: current, index }
    return prev
  }, {} as StringMap)
}

const useBasketChanges = () => {
  const isNewBasketProposed = useAtomValue(isNewBasketProposedAtom)
  const basket = useAtomValue(rTokenBasketAtom)
  const proposedBasket = useAtomValue(basketAtom)

  return useMemo(() => {
    const changes: CollateralChange[] = []

    if (!isNewBasketProposed) {
      return changes
    }

    const targets = Array.from(
      new Set([...Object.keys(basket), ...Object.keys(proposedBasket)])
    )

    for (const target of targets) {
      const proposedTargetBasket = proposedBasket[target]
      const currentTargetBasket = basket[target]

      if (!proposedTargetBasket || !currentTargetBasket) {
        for (const collateral of proposedTargetBasket?.collaterals ||
          currentTargetBasket?.collaterals) {
          changes.push({
            collateral,
            isNew: !!proposedTargetBasket,
          })
        }
      } else {
        // Traverse collaterals for changes in priority/additions/deletions
        const proposedBasketCollateralMap = parseBasket(proposedBasket[target])
        const currentBasketCollateralMap = parseBasket(basket[target])

        const collateralAddresses = new Set([
          ...Object.keys(proposedBasketCollateralMap),
          ...Object.keys(currentBasketCollateralMap),
        ])

        for (const collateralAddress of Array.from(collateralAddresses)) {
          const proposedCollateral =
            proposedBasketCollateralMap[collateralAddress]
          const currentCollateral =
            currentBasketCollateralMap[collateralAddress]

          if (
            (!currentCollateral && proposedCollateral) ||
            (currentCollateral && !proposedCollateral)
          ) {
            changes.push({
              collateral:
                proposedCollateral?.collateral || currentCollateral?.collateral,
              isNew: !!proposedCollateral,
            })
          }
        }
      }
    }

    return changes
  }, [proposedBasket])
}

export default useBasketChanges
