import { atom } from 'jotai'
import rTokenAtom from './rTokenAtom'
import rTokenBackingDistributionAtom from './rTokenBackingDistributionAtom'
import { Basket } from 'components/rtoken-setup/atoms'

const rTokenBasketAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const distribution = get(rTokenBackingDistributionAtom)
  let basket: Basket = {}

  if (!rToken || !distribution) {
    return basket
  }

  return rToken.collaterals.reduce((prev, { address, symbol }) => {
    if (!distribution.collateralDistribution[address]) {
      return prev
    }

    const { targetUnit, share } = distribution.collateralDistribution[address]
    let targetBasket = prev[targetUnit]
    const collateral = {
      targetUnit,
      address,
      symbol,
    }

    if (!targetBasket) {
      targetBasket = {
        scale: '1',
        collaterals: [collateral],
        distribution: [share.toPrecision(6)],
      }
    } else {
      targetBasket.collaterals.push(collateral)
      targetBasket.distribution.push(share.toPrecision(6))
    }

    prev[targetUnit] = targetBasket
    return prev
  }, basket)
})

export default rTokenBasketAtom
