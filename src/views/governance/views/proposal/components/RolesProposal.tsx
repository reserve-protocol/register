import { Trans } from '@lingui/macro'
import RolesSetup from 'components/rtoken-setup/governance/RolesSetup'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { rTokenGuardiansAtom, rTokenManagersAtom } from 'state/atoms'
import { Box, BoxProps, Card, Divider, Text } from 'theme-ui'
import { RoleKey } from 'types'
import { proposedRolesAtom } from '../atoms'

const roleMap: {
  roleKey: RoleKey
  title: string
}[] = [
  { roleKey: 'owners', title: 'Owners' },
  { roleKey: 'pausers', title: 'Pausers' },
  { roleKey: 'freezers', title: 'Freezers' },
  { roleKey: 'longFreezers', title: 'Long Freezers' },
  { roleKey: 'guardians', title: 'Guardians' },
]

const RolesProposal = (props: BoxProps) => {
  const rTokenRoles = useAtomValue(rTokenManagersAtom)
  const guardians = useAtomValue(rTokenGuardiansAtom)
  const [roles, setProposedRoles] = useAtom(proposedRolesAtom)

  useEffect(() => {
    setProposedRoles({ ...rTokenRoles, guardians })
  }, [JSON.stringify({ ...rTokenRoles, guardians })])

  const handleChange = (roleKey: RoleKey, value: string[]) => {}

  return (
    <Card {...props} p={4}>
      <Text variant="sectionTitle">
        <Trans>Governance roles</Trans>
      </Text>
      <Divider my={4} mx={-4} />
      {roleMap.map(({ title, roleKey }, index) => (
        <Box key={roleKey}>
          {!!index && <Divider mb={3} mt={4} mx={-4} />}
          <RolesSetup
            title={title}
            addresses={roles[roleKey]}
            onChange={(value) => handleChange(roleKey, value)}
          />
        </Box>
      ))}
    </Card>
  )
}

export default RolesProposal
