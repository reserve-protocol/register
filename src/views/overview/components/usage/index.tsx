import { Box, Text, Card, Grid } from '@theme-ui/components'
import { InfoBox } from 'components'
import { IReserveToken } from 'state/reserve-tokens/reducer'

const UsageOverview = ({ data, ...props }: { data: IReserveToken }) => (
  <Box {...props}>
    <Text variant="sectionTitle" mb={2}>
      Usage
    </Text>
    <Grid columns={3} mb={5}>
      <Card>
        <InfoBox
          title={(data.token?.transfersCount ?? 0).toLocaleString()}
          subtitle="Total Transactions"
        />
      </Card>
      <Card>
        <InfoBox
          title={(data.token?.transfersCount ?? 0).toLocaleString()}
          description={`$${(data.token?.transfersCount ?? 0).toLocaleString()}`}
          subtitle="24h Volume"
        />
      </Card>
      <Card>
        <InfoBox
          title={(data.token?.holdersCount ?? 0).toLocaleString()}
          subtitle="Holders"
        />
      </Card>
    </Grid>
  </Box>
)

export default UsageOverview
