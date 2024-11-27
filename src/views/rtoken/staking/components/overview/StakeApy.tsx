import { useAtomValue } from 'jotai'
import { estimatedApyAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { formatPercentage } from 'utils'

const StakeApy = () => {
  const { stakers } = useAtomValue(estimatedApyAtom)

  return (
    <Box variant="layout.borderBox" my="4">
      <Box
        variant="layout.verticalAlign"
        sx={{ fontWeight: 700, fontSize: 3 }}
        my={3}
      >
        <Text>Est. Staking Yield:</Text>{' '}
        <Text color="primary" ml="1">
          {formatPercentage(stakers || 0)}
        </Text>
      </Box>
      <Text variant="legend" sx={{ fontSize: 1 }}>
        Manually estimated APY calculated from basket averaged yield. <br />
        <Text sx={{ fontWeight: 500 }}>Calculation:</Text> (avgCollateralYield *
        rTokenMarketCap) / rsrStaked
      </Text>
    </Box>
  )
}

export default StakeApy
