import { t } from '@lingui/macro'
import { useAtom } from 'jotai'
import { BoxProps } from 'theme-ui'
import { shortenAddress } from 'utils'
import { proposedRolesAtom } from '../atoms'
import useRoleChanges, { RoleChange } from '../hooks/useRoleChanges'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

const ProposedRolesPreview = (props: BoxProps) => {
  const changes = useRoleChanges()
  const [proposedRoles, setProposedRoles] = useAtom(proposedRolesAtom)

  if (!changes.length) {
    return null
  }

  const handleRevert = (change: RoleChange) => {
    if (change.isNew) {
      const index = proposedRoles[change.role].indexOf(change.address)

      setProposedRoles({
        ...proposedRoles,
        [change.role]: [
          ...proposedRoles[change.role].slice(0, index),
          ...proposedRoles[change.role].slice(index + 1),
        ],
      })
    } else {
      setProposedRoles({
        ...proposedRoles,
        [change.role]: [...proposedRoles[change.role], change.address],
      })
    }
  }

  return (
    <PreviewBox
      variant="layout.borderBox"
      count={changes.length}
      title={t`Governance roles`}
      {...props}
    >
      {changes.map((change) => (
        <ListChangePreview
          subtitle={change.role.substring(0, change.role.length - 1)}
          onRevert={() => handleRevert(change)}
          isNew={change.isNew}
          value={shortenAddress(change.address)}
          mt={3}
        />
      ))}
    </PreviewBox>
  )
}

export default ProposedRolesPreview
