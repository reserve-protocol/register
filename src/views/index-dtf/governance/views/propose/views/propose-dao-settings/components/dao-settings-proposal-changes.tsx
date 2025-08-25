import { useAtomValue } from 'jotai'
import {
  removedRewardTokensAtom,
  validAddedRewardTokensAtom,
  hasDaoGovernanceChangesAtom,
  hasRolesChangesAtom,
} from '../atoms'
import RevenueTokenChanges from './changes/revenue-token-changes'
import DaoGovernanceChanges from './changes/dao-governance-changes'
import DaoRoleChanges from './changes/dao-role-changes'

const DaoSettingsProposalChanges = () => {
  const removedTokens = useAtomValue(removedRewardTokensAtom)
  const addedTokens = useAtomValue(validAddedRewardTokensAtom)
  const hasGovernanceChanges = useAtomValue(hasDaoGovernanceChangesAtom)
  const hasRolesChanges = useAtomValue(hasRolesChangesAtom)

  const hasRevenueTokenChanges = removedTokens.length > 0 || addedTokens.length > 0
  const hasAnyChanges = hasRevenueTokenChanges || hasGovernanceChanges || hasRolesChanges

  if (!hasAnyChanges) {
    return <div className="p-6 text-center text-legend">No changes</div>
  }

  return (
    <div className="space-y-4">
      <RevenueTokenChanges />
      <DaoGovernanceChanges />
      <DaoRoleChanges />
    </div>
  )
}

export default DaoSettingsProposalChanges