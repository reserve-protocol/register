import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, Text, BoxProps } from 'theme-ui'
import collateralPlugins from 'utils/plugins'
import CollateralItem, { WrapCollateralType } from './CollateralItem'

export const CONVEX_COLLATERALS = new Set([
  'stkcvx3Crv',
  'stkcvxeUSD3CRV-f',
  'stkcvxMIM-3LP3CRV-f',
])

interface Props extends BoxProps {
  wrapping: boolean
}

const ConvexCollaterals = ({ wrapping, ...props }: Props) => {
  const chainId = useAtomValue(chainIdAtom)
  const collateralList = useMemo(
    () =>
      collateralPlugins[chainId]
        .filter((c) => CONVEX_COLLATERALS.has(c.symbol))
        .map((c) => ({ ...c, referenceUnit: c.symbol.substring(3) })),
    [chainId]
  )

  // Don't show section if no collateral is available
  if (!collateralList.length) {
    return null
  }

  return (
    <Box {...props} px={4}>
      <Text variant="strong">Curve Convex LP Tokens</Text>
      {collateralList.map((c) => (
        <CollateralItem
          key={c.address}
          mt={3}
          collateral={c}
          wrapping={wrapping}
          type={WrapCollateralType.Convex}
        />
      ))}
    </Box>
  )
}

export default ConvexCollaterals
