import { Trans } from '@lingui/macro'
import { BoxProps, Card, Divider, Text } from 'theme-ui'
import TokenForm from './TokenForm'

/**
 * View: Deploy -> Token setup
 * Display token forms
 */
const TokenParameters = (props: BoxProps) => (
  <Card p={4} variant="cards.form" {...props}>
    <Text variant="title">
      <Trans>Basics</Trans>
    </Text>
    <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
    <TokenForm />
  </Card>
)

export default TokenParameters
