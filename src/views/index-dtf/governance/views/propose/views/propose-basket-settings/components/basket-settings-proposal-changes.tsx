import { useAtomValue } from 'jotai'
import { hasBasketGovernanceChangesAtom, hasRolesChangesAtom } from '../atoms'
import BasketGovernanceChanges from './changes/basket-governance-changes'
import BasketRoleChanges from './changes/basket-role-changes'

const BasketSettingsProposalChanges = () => {
  const hasGovernanceChanges = useAtomValue(hasBasketGovernanceChangesAtom)
  const hasRolesChanges = useAtomValue(hasRolesChangesAtom)

  const hasAnyChanges = hasGovernanceChanges || hasRolesChanges

  if (!hasAnyChanges) {
    return <div className="p-6 text-center text-legend">No changes</div>
  }

  return (
    <div className="space-y-4">
      <BasketGovernanceChanges />
      <BasketRoleChanges />
    </div>
  )
}

export default BasketSettingsProposalChanges