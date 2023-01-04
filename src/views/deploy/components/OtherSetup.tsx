import { Trans } from '@lingui/macro'
import BackingForm from 'components/rtoken-setup/token/BackingForm'
import OtherForm from 'components/rtoken-setup/token/OtherForm'
import { BoxProps, Card, Divider, Text } from 'theme-ui'

const OtherSetup = (props: BoxProps) => {
  return (
    <Card p={4} {...props}>
      <Text ml={2} variant="title">
        <Trans>Other parameters</Trans>
      </Text>
      <Divider my={3} />
      <OtherForm />
    </Card>
  )
}

export default OtherSetup
