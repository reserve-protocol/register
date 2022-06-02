import styled from '@emotion/styled'
import { Box, Text, Card, Grid, BoxProps } from 'theme-ui'
import { InfoBox } from 'components'
import { ReserveToken } from 'types'

interface Props extends BoxProps {
  data: ReserveToken
}

const Info = styled(InfoBox)`
  border-right: 1px solid #e4e5e7;

  &:last-child {
    border-right: none;
  }
`

const UsageOverview = ({ data, ...props }: Props) => (
  <Box {...props}>
    <Text variant="sectionTitle" mb={2}>
      Usage
    </Text>
    <Card>
      <Grid columns={3}>
        <Info subtitle={(0).toLocaleString()} title="Total Transactions" />
        <Info subtitle={(0).toLocaleString()} title="24h Volume" />
        <Info subtitle={(0).toLocaleString()} title="Holders" />
      </Grid>
    </Card>
  </Box>
)

export default UsageOverview
