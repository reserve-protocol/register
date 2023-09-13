import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, Text, BoxProps } from 'theme-ui'
import collateralPlugins from 'utils/plugins'
import CollateralItem, { WrapCollateralType } from './CollateralItem'

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
      <Text variant="strong">Aave V2 Tokens</Text>
      {collateralList.map((c) => (
        <CollateralItem
          key={c.address}
          mt={3}
          collateral={c}
          wrapping={wrapping}
          type={WrapCollateralType.AaveV2}
        />
      ))}
    </Box>
  )
}

export default AaveCollaterals
