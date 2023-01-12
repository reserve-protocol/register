import { Basket, basketAtom } from 'components/rtoken-setup/atoms'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { rTokenAtom, rTokenCollateralDist } from 'state/atoms'

const primaryBasketAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const basketDistribution = get(rTokenCollateralDist)

  return rToken?.collaterals.reduce((prev, { address, symbol }) => {
    if (!basketDistribution[address]) {
      return prev
    }

    const { targetUnit, share } = basketDistribution[address]
    let targetBasket = prev[targetUnit]
    const collateral = {
      targetUnit,
      address,
      symbol,
    }

    if (!targetBasket) {
      targetBasket = {
        scale: '',
        collaterals: [collateral],
        distribution: [share.toFixed(2)],
      }
    } else {
      targetBasket.collaterals.push(collateral)
      targetBasket.distribution.push(share.toFixed(2))
    }

    prev[targetUnit] = targetBasket
    return prev
  }, {} as Basket)
})

const useRTokenMeta = () => {
  const basketDist = useAtomValue(primaryBasketAtom)
  const setPrimaryBasket = useSetAtom(basketAtom)

  useEffect(() => {
    setPrimaryBasket(basketDist || {})
  }, [basketDist])

  useEffect(() => {
    return () => {
      setPrimaryBasket({})
    }
  }, [])

  return null
}

export default useRTokenMeta
