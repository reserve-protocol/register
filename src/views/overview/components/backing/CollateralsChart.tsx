import useRToken from 'hooks/useRToken'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rTokenBackingDistributionAtom, rTokenStateAtom } from 'state/atoms'
import { stringToColor } from 'utils'
import { COLLATERAL_STATUS } from 'utils/constants'
import CollateralPieChart from '../CollateralPieChart'
import { collateralsMetadataAtom } from 'state/cms/atoms'

const basketDistAtom = atom((get) => {
  return get(rTokenBackingDistributionAtom)?.collateralDistribution || {}
})

const getCollateralColor = (status: 0 | 1 | 2) => {
  if (status === COLLATERAL_STATUS.IFFY) {
    return 'warning'
  } else if (status === COLLATERAL_STATUS.DEFAULT) {
    return 'danger'
  }

  return 'text'
}

const CollateralsChart = () => {
  const rToken = useRToken()
  const basketDist = useAtomValue(basketDistAtom)
  const distribution = useAtomValue(rTokenBackingDistributionAtom)
  const metadata = useAtomValue(collateralsMetadataAtom)
  const rTokenState = useAtomValue(rTokenStateAtom)

  const pieData = useMemo(() => {
    if (rToken?.address && basketDist && Object.keys(basketDist)) {
      return rToken.collaterals.map((c) => {
        const cmsCollateral =
          metadata?.[c.symbol.toLowerCase().replace('-vault', '')]
        return {
          name: c.name,
          value: basketDist[c.address]?.share ?? 0,
          color: cmsCollateral?.color || stringToColor(c.address),
          project: cmsCollateral?.protocol?.name || 'GENERIC',
          projectColor: cmsCollateral?.protocol?.color || 'gray',
        }
      })
    }

    return []
  }, [JSON.stringify(basketDist), rToken?.address])
  return (
    <CollateralPieChart
      my={3}
      data={pieData}
      logo={rToken?.logo ?? ''}
      staked={distribution?.staked ?? 0}
      showTooltip
      isRebalancing={!(rTokenState?.isCollaterized ?? true)}
    />
  )
}

export default CollateralsChart
