import { Box, Grid, Text } from '@theme-ui/components'
import { Card } from 'components'
import InfoBox from 'components/info-box'
import { formatEther } from 'ethers/lib/utils'
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
  ...props
}: {
  data: ReserveToken
}) => (
  <Box {...props}>
    <Text sx={{ fontSize: 4, display: 'block' }} mb={2}>
      Assets
    </Text>
    <Card p={4}>
      <InfoBox
        title={`${
          token?.supply
            ? formatCurrency(parseFloat(formatEther(token.supply)))
            : '0'
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

export default AssetsOverview
