import { Trans } from '@lingui/macro'
import { Box, Link, Text } from 'theme-ui'

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
    <Text variant="strong" mb={2} mt={4}>
      <Trans>When will I get my RTokens?</Trans>
    </Text>
    <Text as="p" variant="legend">
      <Trans>
        Depending on RToken minting activity and the size of your deposit, the
        protocol will either issue your RTokens immediately or mint them over
        the period of a few blocks (a "slow mint"). "Slow mints" are designed
        into the protocol to ensure stability of the RToken's price and
        redemption rate while there are ongoing mints and revenue operations.
      </Trans>
      <br />
      <br />
      <Trans>
        To learn more about minting and redemption operations, read the
        documentation
      </Trans>{' '}
      <Link
        href="https://reserve.org/protocol/protocol_operations/"
        target="_blank"
        sx={{ textDecoration: 'underline' }}
      >
        <Trans>here</Trans>
      </Link>
    </Text>
  </Box>
)

export default About
