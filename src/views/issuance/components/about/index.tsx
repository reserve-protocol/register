import { Trans } from '@lingui/macro'
import { Box, Text } from 'theme-ui'

const About = () => (
  <Box variant="layout.borderBox" p={4} sx={{ height: 'fit-content' }}>
    <Text variant="strong" mb={2}>
      <Trans>How does this work? </Trans>
    </Text>
    <Text as="p" variant="legend">
      <Trans>
        Minting requires a deposit of the defined collateral tokens in equal
        value amounts to the RToken smart contracts.
      </Trans>
    </Text>
  </Box>
)

export default About
