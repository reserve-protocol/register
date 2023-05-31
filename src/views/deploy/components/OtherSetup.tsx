import { Trans } from '@lingui/macro'
import OtherForm from 'components/rtoken-setup/token/OtherForm'
import { BoxProps, Card, Divider, Text } from 'theme-ui'

const OtherSetup = (props: BoxProps) => (
  <Card p={4} {...props}>
    <Text variant="title">
      <Trans>Other parameters</Trans>
    </Text>
    <Divider my={4} mx={-4} />
    <OtherForm />
  </Card>
)

export default OtherSetup
