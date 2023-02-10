import { Trans } from '@lingui/macro'
import { Box, BoxProps, Card, Divider, Text } from 'theme-ui'

const RoleEdition = () => {}

const RolesProposal = (props: BoxProps) => {
  return (
    <Card {...props} p={4}>
      <Text variant="sectionTitle">
        <Trans>Governance roles</Trans>
      </Text>
      <Divider my={4} mx={-4} />
    </Card>
  )
}

export default RolesProposal
