import { useAtomValue } from 'jotai'
import {
  removedRewardTokensAtom,
  validAddedRewardTokensAtom,
  hasDaoGovernanceChangesAtom,
} from '../atoms'
import RevenueTokenChanges from './changes/revenue-token-changes'
import DaoGovernanceChanges from './changes/dao-governance-changes'

const DaoSettingsProposalChanges = () => {
  const removedTokens = useAtomValue(removedRewardTokensAtom)
  const addedTokens = useAtomValue(validAddedRewardTokensAtom)
  const hasGovernanceChanges = useAtomValue(hasDaoGovernanceChangesAtom)

  const hasRevenueTokenChanges = removedTokens.length > 0 || addedTokens.length > 0
  const hasAnyChanges = hasRevenueTokenChanges || hasGovernanceChanges

  if (!hasAnyChanges) {
    return <div className="p-6 text-center text-legend">No changes</div>
  }

  return (
    <div className="space-y-4">
      <RevenueTokenChanges />
      <DaoGovernanceChanges />
    </div>
  )
}

export default DaoSettingsProposalChanges