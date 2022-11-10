import { Trans, t } from '@lingui/macro'
import { useMemo } from 'react'
import { Box, Card, Grid, Text } from 'theme-ui'

const Navigation = () => {
  const items = useMemo(
    () => [
      { label: t`Intro` },
      { label: t`Primary Basket` },
      { label: t`Emergency Basket` },
    ],
    []
  )

  return (
    <Box>
      <Text variant="title">
        <Trans>Navigation</Trans>
      </Text>
      <Box></Box>
    </Box>
  )
}

const Summary = () => {
  return <Box variant="layout.borderBox">Preview</Box>
}

const Proposal = () => {
  return <Card>Proposal</Card>
}

const Governance = () => {
  return (
    <Grid columns={['1fr 1fr 1fr']} padding={[4, 5]}>
      <Navigation />
      <Proposal />
      <Summary />
    </Grid>
  )
}

export default Governance
