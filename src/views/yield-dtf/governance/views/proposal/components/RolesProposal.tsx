import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { Trans, useLingui } from '@lingui/react/macro'
import RolesEdit from 'components/rtoken-setup/components/RolesEdit'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { rTokenGovernanceAtom, rTokenManagersAtom } from 'state/atoms'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RoleKey } from 'types'
import { proposedRolesAtom } from '../atoms'

const roleMap: {
  roleKey: RoleKey
  title: MessageDescriptor
}[] = [
    { roleKey: 'owners', title: msg`Owners` },
    { roleKey: 'pausers', title: msg`Pausers` },
    { roleKey: 'freezers', title: msg`Freezers` },
    { roleKey: 'longFreezers', title: msg`Long Freezers` },
    { roleKey: 'guardians', title: msg`Guardians` },
  ]

interface RolesProposalProps {
  className?: string
}

const RolesProposal = ({ className }: RolesProposalProps) => {
  const { t } = useLingui()
  const rTokenRoles = useAtomValue(rTokenManagersAtom)
  const { guardians = [] } = useAtomValue(rTokenGovernanceAtom)
  const [roles, setProposedRoles] = useAtom(proposedRolesAtom)

  useEffect(() => {
    setProposedRoles({ ...rTokenRoles, guardians })
  }, [JSON.stringify({ ...rTokenRoles, guardians })])

  const handleChange = (roleKey: RoleKey, value: string[]) => {
    setProposedRoles({ ...roles, [roleKey]: value })
  }

  return (
    <Card className={`p-6 bg-secondary ${className || ''}`}>
      <span className="text-lg font-semibold">
        <Trans>Governance roles</Trans>
      </span>
      <Separator className="my-6 -mx-6 w-[calc(100%+3rem)]" />
      {roleMap.map(({ title, roleKey }, index) => (
        <div key={roleKey}>
          {!!index && <Separator className="mb-4 mt-6 -mx-6 w-[calc(100%+3rem)]" />}
          <RolesEdit
            title={t(title)}
            addresses={roles[roleKey]}
            onChange={(value) => handleChange(roleKey, value)}
          />
        </div>
      ))}
    </Card>
  )
}

export default RolesProposal
