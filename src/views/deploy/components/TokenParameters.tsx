import { Trans } from '@lingui/macro'
import { BoxProps, Card, Divider, Text } from 'theme-ui'
import TokenForm from './TokenForm'

const chevronProps = {
  style: {
    marginRight: 10,
  },
  size: 20,
}

/**
 * View: Deploy -> Token setup
 * Display token forms
 */
const TokenParameters = (props: BoxProps) => (
  <Card p={4} {...props}>
    <Text ml={2} variant="sectionTitle">
      <Trans>Basics</Trans>
    </Text>
    <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
    <TokenForm />
  </Card>
)

export default TokenParameters
