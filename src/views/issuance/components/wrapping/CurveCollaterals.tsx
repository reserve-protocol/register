import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, Text, BoxProps } from 'theme-ui'
import collateralPlugins from 'utils/plugins'
import CollateralItem, { WrapCollateralType } from './CollateralItem'

export const CURVE_COLLATERALS = new Set([
  'crv3Pool',
  'crveUSDFRAXBP',
  'crvMIM3Pool',
])

interface Props extends BoxProps {
  wrapping: boolean
}

const CurveCollaterals = ({ wrapping, ...props }: Props) => {
  const chainId = useAtomValue(chainIdAtom)
  const collateralList = useMemo(
    () =>
      collateralPlugins[chainId]
        .filter((c) => CURVE_COLLATERALS.has(c.symbol))
        .map((c) => ({ ...c, referenceUnit: c.symbol.substring(3) })),
    [chainId]
  )

  // Don't show section if no collateral is available
  if (!collateralList.length) {
    return null
  }

  return (
    <Box {...props} px={4}>
      <Text variant="strong">Curve LP Tokens</Text>
      {collateralList.map((c) => (
        <CollateralItem
          key={c.address}
          mt={3}
          collateral={c}
          wrapping={wrapping}
          type={WrapCollateralType.Curve}
        />
      ))}
    </Box>
  )
}

export default CurveCollaterals
