import { atom } from 'jotai'
import {
  btcPriceAtom,
  ethPriceAtom,
  rTokenBackingDistributionAtom,
  rTokenPriceAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { TARGET_UNITS } from 'utils/constants'

const rTokenPegAtom = atom((get) => {
  const distribution = get(rTokenBackingDistributionAtom)

  if (!distribution) {
    return null
  }

  let peg = ''

  for (const { targetUnit } of Object.values(
    distribution.collateralDistribution
  )) {
    if (!peg) {
      peg = targetUnit
    } else if (peg !== targetUnit) {
      return TARGET_UNITS.USD
    }
  }

  return peg
})

export const rTokenTargetPriceAtom = atom((get) => {
  const { tokenSupply, basketsNeeded } = get(rTokenStateAtom)
  const peg = get(rTokenPegAtom)
  // TODO: This should also start null
  const price = get(rTokenPriceAtom)
  const ethPrice = get(ethPriceAtom)
  const btcPrice = get(btcPriceAtom)

  if (
    tokenSupply &&
    basketsNeeded &&
    btcPrice &&
    (peg === TARGET_UNITS.ETH || peg === TARGET_UNITS.BTC)
  ) {
    const pegPrice = TARGET_UNITS.ETH ? ethPrice : btcPrice
    let supplyInUnit = (tokenSupply / price) * pegPrice
    let priceInUnit = Math.trunc((basketsNeeded / tokenSupply) * 10000) / 10000

    return { price: priceInUnit, supply: supplyInUnit, unit: peg }
  }

  return null
})
