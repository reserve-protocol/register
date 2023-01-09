import { Trans } from '@lingui/macro'
import BackingForm from 'components/rtoken-setup/token/BackingForm'
import { BoxProps, Card, Divider, Text } from 'theme-ui'

const BackingManager = (props: BoxProps) => {
  return (
    <Card p={4} {...props}>
      <Text ml={2} variant="sectionTitle">
        <Trans>Backing Manager</Trans>
      </Text>
      <Divider my={4} mx={-4} />
      <BackingForm />
    </Card>
  )
}

export default BackingManager
