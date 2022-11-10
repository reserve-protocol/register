import { Trans, t } from '@lingui/macro'
import { useMemo } from 'react'
import { Box, BoxProps, Card, Grid, Text } from 'theme-ui'

const Navigation = (props: BoxProps) => {
  const items = useMemo(
    () => [
      { label: t`Intro` },
      { label: t`Primary basket` },
      { label: t`Emergency basket` },
      { label: t`RToken params` },
      { label: t`Governance params` },
      { label: t`Roles` },
    ],
    []
  )

  return (
    <Box {...props}>
      <Text variant="title">
        <Trans>Navigation</Trans>
      </Text>
      <Box as="ul" mt={5} mr={3} p={0} sx={{ listStyle: 'none' }}>
        {items.map((item) => (
          <Box
            as="li"
            pl={4}
            mb={4}
            sx={{
              lineHeight: '24px',
              borderLeft: '3px solid',
              borderColor: 'text',
              cursor: 'pointer',
            }}
          >
            <Text>{item.label}</Text>
          </Box>
        ))}
      </Box>
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
    <Grid
      columns={['1fr', '1fr 1fr', '1fr 1fr', 'auto 1fr 420px']}
      gap={4}
      padding={[4, 5]}
    >
      <Navigation sx={{ display: ['none', 'none', 'none', 'inherit'] }} />
      <Proposal />
      <Summary />
    </Grid>
  )
}

export default Governance
