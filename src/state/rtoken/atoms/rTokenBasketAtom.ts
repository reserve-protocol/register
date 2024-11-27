import { atom } from 'jotai'
import rTokenAtom from './rTokenAtom'
import rTokenBackingDistributionAtom from './rTokenBackingDistributionAtom'
import { Basket } from 'components/rtoken-setup/atoms'
import rTokenAssetsAtom from './rTokenAssetsAtom'

const rTokenBasketAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const assets = get(rTokenAssetsAtom)
  const distribution = get(rTokenBackingDistributionAtom)
  let basket: Basket = {}

  if (!rToken || !distribution || !assets) {
    return basket
  }

  return rToken.collaterals.reduce((prev, { address, symbol }) => {
    if (!distribution.collateralDistribution[address]) {
      return prev
    }

    const { targetUnit, share } = distribution.collateralDistribution[address]
    let targetBasket = prev[targetUnit]
    const collateral = {
      targetName: targetUnit,
      address: assets[address].address,
      symbol,
      erc20: address,
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
