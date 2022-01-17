import { Box, Grid, Text } from '@theme-ui/components'
import { Card } from 'components'
import InfoBox from 'components/info-box'
import { formatEther } from 'ethers/lib/utils'
import useTokenSupply from 'hooks/useTokenSupply'
import { ReserveToken } from 'types'
import { formatCurrency } from 'utils'

/**
 * RToken Assets overview
 * Display the market cap of the current RToken and the ratio between the RToken and their vault collaterals
 *
 * @prop data: ReserveToken
 * @returns React.Component
 */
const AssetsOverview = ({
  data: { token, vault },
  isRSV,
  ...props
}: {
  data: ReserveToken
  isRSV?: boolean
}) => {
  // TODO: For RTokens consult this from the explorer view contract
  // TODO: More than the expected basket tokens could be returned
  const assetDistribution = []
  const marketCap = useTokenSupply(token.address)

  if (isRSV) {
  }

  return (
    <Box {...props}>
      <Text sx={{ fontSize: 4, display: 'block' }} mb={2}>
        Assets
      </Text>
      <Card p={4}>
        <InfoBox
          title={`${
            marketCap ? formatCurrency(parseFloat(formatEther(marketCap))) : '0'
          } ${token.symbol}`}
          subtitle="In circulation"
        />
      </Card>
      <Grid columns={3} gap={0} mb={5}>
        {vault.collaterals.map((collateral) => (
          <Card key={collateral.id}>
            <InfoBox title="0.00" subtitle={collateral.token.name} />
          </Card>
        ))}
      </Grid>
    </Box>
  )
}

export default AssetsOverview
