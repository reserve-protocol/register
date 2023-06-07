import { useAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { Box, BoxProps, Divider } from 'theme-ui'
import { setupRolesAtom } from '../atoms'
import RolesEdit from '../components/RolesEdit'

type RoleKey = 'pausers' | 'shortFreezers' | 'longFreezers'

const roleMap: {
  roleKey: RoleKey
  title: string
  help: string
}[] = [
  {
    roleKey: 'pausers',
    title: 'Pausers',
    help: 'The pauser has the ability to pause and unpause an RToken’s system. The PAUSER role should be assigned to an address that is able to act quickly in response to off-chain events, such as a Chainlink feed failing. It is ok to have multiple pausers. It can be robot-controlled. It can also consist of a 1-of-N multisig for high availability and coverage. It is acceptable for there to be false positives, since redemption remains enabled.',
  },
  {
    roleKey: 'shortFreezers',
    title: 'Short Freezers',
    help: 'The short freezer has the ability to freeze an RToken’s system for a short period of time. The SHORT_FREEZER role should be assigned to an address that might reasonably be expected to be the first to detect a bug in the code and can act quickly, and with some tolerance for false positives, though less than in pausing. It is acceptable to have multiple short freezers. It can be robot-controlled. It can also consist of a 1-of-N multisig for high availability and coverage. If a bug is detected, a short freeze can be triggered which will automatically expire if it is not renewed by LONG_FREEZER.',
  },
  {
    roleKey: 'longFreezers',
    title: 'Long Freezers',
    help: 'The long freezer has the ability to freeze an RToken’s system for a long period of time. The LONG_FREEZER role should be assigned to an address that will highly optimize for no false positives. It is much longer than the short freeze. It can act slowly and needs to be trusted. It is probably expected to have only one long-freezer address. It allows only 6x uses per long-freezer. It exists so that in the case of a zero-day exploit, governance can act before the system unfreezes and resumes functioning. ',
  },
]

const RolesSetup = (props: BoxProps) => {
  const [roles, setRoles] = useAtom(setupRolesAtom)
  const resetRoles = useResetAtom(setupRolesAtom)

  useEffect(() => resetRoles, [])

  const handleChange = (roleKey: RoleKey, value: string[]) => {
    setRoles({ ...roles, [roleKey]: value })
  }

  return (
    <Box {...props}>
      {roleMap.map(({ title, roleKey, help }, index) => (
        <Box key={roleKey}>
          <RolesEdit
            title={title}
            addresses={roles[roleKey] || []}
            onChange={(value) => handleChange(roleKey, value)}
            help={help}
            compact
            mt={4}
          />
        </Box>
      ))}
    </Box>
  )
}

export default RolesSetup
