import { Trans } from '@lingui/macro'
import { Box, Text, Card, Grid } from 'theme-ui'

const GovernanceConfigured = () => {
  return (
    <Box p={5}>
      <Box mb={4}>
        <Text sx={{ display: 'block', fontSize: 4, fontWeight: 500 }}>
          <Trans>Governance setup completed</Trans>
        </Text>
        <Text variant="legend">TODO COPY</Text>
      </Box>
      <Grid columns={2} gap={5}>
        <Card>Info about deployment here</Card>
        <Box variant="layout.borderBox">TODO?</Box>
      </Grid>
    </Box>
  )
}

export default GovernanceConfigured
