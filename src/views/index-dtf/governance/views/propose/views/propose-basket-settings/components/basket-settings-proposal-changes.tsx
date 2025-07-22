import { useAtomValue } from 'jotai'
import { hasBasketGovernanceChangesAtom } from '../atoms'
import BasketGovernanceChanges from './changes/basket-governance-changes'

const BasketSettingsProposalChanges = () => {
  const hasGovernanceChanges = useAtomValue(hasBasketGovernanceChangesAtom)

  const hasAnyChanges = hasGovernanceChanges

  if (!hasAnyChanges) {
    return <div className="p-6 text-center text-legend">No changes</div>
  }

  return (
    <div className="space-y-4">
      <BasketGovernanceChanges />
    </div>
  )
}

export default BasketSettingsProposalChanges