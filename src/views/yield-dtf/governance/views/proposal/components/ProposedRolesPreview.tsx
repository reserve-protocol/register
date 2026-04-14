import { t } from '@lingui/macro'
import { useAtom, useAtomValue } from 'jotai'
import { cn } from '@/lib/utils'
import { shortenAddress } from 'utils'
import { proposedRolesAtom, roleChangesAtom } from '../atoms'
import { RoleChange } from '../hooks/useRoleChanges'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

interface Props {
  className?: string
}

const ProposedRolesPreview = ({ className }: Props) => {
  const changes = useAtomValue(roleChangesAtom)
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
      className={cn('border border-border rounded-xl p-6', className)}
      count={changes.length}
      title={t`Governance roles`}
    >
      {changes.map((change) => (
        <ListChangePreview
          key={`${change.role}-${change.address}`}
          subtitle={change.role.substring(0, change.role.length - 1)}
          onRevert={() => handleRevert(change)}
          isNew={change.isNew}
          value={shortenAddress(change.address)}
          className="mt-4"
        />
      ))}
    </PreviewBox>
  )
}

export default ProposedRolesPreview
