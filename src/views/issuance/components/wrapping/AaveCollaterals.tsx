import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, Text, BoxProps } from 'theme-ui'
import collateralPlugins from 'utils/plugins'
import CollateralItem from './CollateralItem'

export const AAVE_COLLATERALS = new Set(['saDAI', 'saUSDC', 'saUSDT'])

interface Props extends BoxProps {
  wrapping: boolean
}

const AaveCollaterals = ({ wrapping, ...props }: Props) => {
  const chainId = useAtomValue(chainIdAtom)
  const collateralList = useMemo(
    () =>
      collateralPlugins[chainId].filter((c) => AAVE_COLLATERALS.has(c.symbol)),
    [chainId]
  )

  // Don't show section if no collateral is available
  if (!collateralList.length) {
    return null
  }

  return (
    <Box {...props} px={4}>
      <Text variant="strong">Aave tokens</Text>
      {collateralList.map((c) => (
        <CollateralItem mt={3} collateral={c} wrapping={wrapping} />
      ))}
    </Box>
  )
}

export default AaveCollaterals
