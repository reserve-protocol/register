import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, Text, BoxProps } from 'theme-ui'
import collateralPlugins from 'utils/plugins'
import CollateralItem from './CollateralItem'

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
      <Text variant="strong">Convex LP tokens</Text>
      {collateralList.map((c) => (
        <CollateralItem mt={3} collateral={c} wrapping={wrapping} />
      ))}
    </Box>
  )
}

export default ConvexCollaterals
