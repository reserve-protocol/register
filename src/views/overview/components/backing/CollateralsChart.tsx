import useRToken from 'hooks/useRToken'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  rTokenAtom,
  rTokenBackingDistributionAtom,
  rTokenCollateralStatusAtom,
  rTokenPriceAtom,
} from 'state/atoms'
import { stringToColor } from 'utils'
import cms from 'utils/cms'
import { COLLATERAL_STATUS } from 'utils/constants'
import RSV from 'utils/rsv'
import usePriceETH from 'views/home/hooks/usePriceETH'
import CollateralPieChart from '../CollateralPieChart'

const basketDistAtom = atom((get) => {
  const rToken = get(rTokenAtom)

  if (rToken && !rToken.main) {
    return RSV.collaterals.reduce(
      (acc, current) => ({
        ...acc,
        [current.address]: {
          share: 100,
          targetUnit: 'USD',
        },
      }),
      {} as { [x: string]: { share: number; targetUnit: string } }
    )
  }

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
  // const price = useAtomValue(rTokenPriceAtom)
  // const { priceETHTerms } = usePriceETH({
  //   id: rToken?.address,
  //   chain: rToken?.chainId,
  //   supply: rToken?.supply,
  //   price,
  //   targetUnits: rToken?.targetUnits,
  //   basketsNeeded: rToken?.basketsNeeded,
  // })
  const pieData = useMemo(() => {
    if (rToken?.address && basketDist && Object.keys(basketDist)) {
      return rToken.collaterals.map((c) => {
        const cmsCollateral = cms.collaterals.find(
          (collateral) =>
            collateral.chain === rToken.chainId &&
            collateral.symbol === c.symbol
        )
        const cmsProject = cms.projects.find(
          (project) => project.name === cmsCollateral?.project
        )
        return {
          name: c.name,
          value: basketDist[c.address]?.share ?? 0,
          color: cmsCollateral?.color || stringToColor(c.address),
          project: cmsProject?.label || 'GENERIC',
          projectColor: cmsProject?.color || 'gray',
        }
      })
    }

    return []
  }, [JSON.stringify(basketDist), rToken?.address])
  return (
    <CollateralPieChart
      mb={4}
      mt={2}
      data={pieData}
      logo={rToken?.logo ?? ''}
      staked={distribution?.staked ?? 0}
      showTooltip
    />
  )
}

export default CollateralsChart
