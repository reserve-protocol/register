import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'
import collateralPlugins from 'utils/plugins'
import CollateralItem, { WrapCollateralType } from './CollateralItem'

export const MORPHO_COLLATERALS = new Set([
  'mrp-aDAI',
  'mrp-aUSDT',
  'mrp-aUSDC',
  'mrp-aWBTC',
  'mrp-aWETH',
  'mrp-aSTETH',
])

interface Props extends BoxProps {
  wrapping: boolean
}

const MorphoCollaterals = ({ wrapping, ...props }: Props) => {
  const chainId = useAtomValue(chainIdAtom)
  const collateralList = useMemo(
    () =>
      collateralPlugins[chainId]
        .filter((c) => MORPHO_COLLATERALS.has(c.symbol))
        .map((c) => ({ ...c, referenceUnit: c.symbol.substring(4) })),
    [chainId]
  )

  // Don't show section if no collateral is available
  if (!collateralList.length) {
    return null
  }

  return (
    <Box {...props} px={4}>
      <Text variant="strong">Convex LP tokens</Text>
      {collateralList.map((c) => (
        <CollateralItem
          key={c.address}
          mt={3}
          collateral={c}
          wrapping={wrapping}
          type={WrapCollateralType.Morpho}
        />
      ))}
    </Box>
  )
}

export default MorphoCollaterals
