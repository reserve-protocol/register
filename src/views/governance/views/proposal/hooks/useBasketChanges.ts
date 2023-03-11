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

function parseBasket(
  basket: PrimaryUnitBasket,
  symbol = false
): {
  [x: string]: { collateral: Collateral; index: number }
} {
  return (basket?.collaterals ?? []).reduce((prev, current, index) => {
    prev[symbol ? current.symbol : current.address] = {
      collateral: current,
      index,
    }
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
        const proposedBasketCollateralMap = parseBasket(
          proposedBasket[target],
          true
        )
        const currentBasketCollateralMap = parseBasket(basket[target], true)

        const collateralSymbols = new Set([
          ...Object.keys(proposedBasketCollateralMap),
          ...Object.keys(currentBasketCollateralMap),
        ])

        for (const collateralSymbol of Array.from(collateralSymbols)) {
          const proposedCollateral =
            proposedBasketCollateralMap[collateralSymbol]
          const currentCollateral = currentBasketCollateralMap[collateralSymbol]

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
