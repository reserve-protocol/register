import { Trans } from '@lingui/macro'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import { atom, useAtomValue } from 'jotai'
import Skeleton from 'react-loading-skeleton'
import { rTokenAtom, rTokenBackingDistributionAtom } from 'state/atoms'
import AssetBreakdown from './asset-breakdown'
import RevenueSplitOverview from './revenue-split-overview'
import BuckingBuffer from './backing-buffer'

// TODO: Localization?
const pegsAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const distribution = get(
    rTokenBackingDistributionAtom
  )?.collateralDistribution

  if (!rToken || !distribution) {
    return null
  }

  const unitCount = rToken.collaterals.reduce(
    (acc, collateral) => {
      acc[distribution[collateral.address].targetUnit] =
        acc[distribution[collateral.address].targetUnit] + 1 || 1
      return acc
    },
    {} as { [x: string]: number }
  )

  const totalUnits = Object.keys(unitCount).length

  return Object.entries(unitCount).reduce((acc, [unit, count], index) => {
    if (index && index === totalUnits - 1) {
      acc += ' and '
    } else if (index) {
      acc += ', '
    }

    acc += `${count} Collateral${count > 1 ? 's' : ''} pegged to ${unit}`

    return acc
  }, `${rToken.symbol} has `)
})

const unitCountAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const distribution = get(
    rTokenBackingDistributionAtom
  )?.collateralDistribution

  if (!rToken || !distribution) {
    return 0
  }

  const unitCount = rToken.collaterals.reduce(
    (acc, collateral) => {
      acc[distribution[collateral.address].targetUnit] =
        acc[distribution[collateral.address].targetUnit] + 1 || 1
      return acc
    },
    {} as { [x: string]: number }
  )

  return Object.keys(unitCount).length
})

const BackingResume = () => {
  const unitCount = useAtomValue(unitCountAtom)
  const legend = useAtomValue(pegsAtom)

  if (unitCount > 2) return <div className="mb-8" />

  return (
    <h2 className="ml-6 mt-2 mb-8 text-xl font-semibold">
      {legend ? legend : <Skeleton />}
    </h2>
  )
}

const Backing = () => (
  <div>
    <div className="flex items-center ml-6 mb-6 mt-10 text-primary">
      <BasketCubeIcon fontSize={24} />
      <h2 className="ml-2 text-2xl font-semibold">
        <Trans>Backing & Risk</Trans>
      </h2>
    </div>
    <p className="ml-6 text-lg max-w-[540px]">
      <Trans>
        RTokens are 100% backed by a diversified set of underlying collateral
        tokens...
      </Trans>
    </p>
    <BackingResume />
    <AssetBreakdown />
    <hr className="my-10 border-border" />
    <BuckingBuffer />
    <hr className="my-10 border-border" />
    <RevenueSplitOverview />
  </div>
)

export default Backing
