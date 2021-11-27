import { Box, Text, Card, Grid } from '@theme-ui/components'
import { InfoBox } from 'components'
import { IReserveToken } from 'state/reserve-tokens/reducer'

const UsageOverview = ({ data, ...props }: { data: IReserveToken }) => (
  <Box {...props}>
    <Text sx={{ fontSize: 4, display: 'block' }} mb={2}>
      Usage
    </Text>
    <Grid columns={3} mb={3}>
      <Card>
        <InfoBox title="2,102,123" subtitle="Total Transactions" />
      </Card>
      <Card>
        <InfoBox
          title="3,241,231"
          description="$3,241,231"
          subtitle="24h Volume"
        />
      </Card>
      <Card>
        <InfoBox title="243,123" subtitle="Holders" />
      </Card>
    </Grid>
  </Box>
)

export default UsageOverview
