import { useAtomValue } from 'jotai'
import {
  removedBasketTokensAtom,
  hasMandateChangeAtom,
  hasRolesChangesAtom,
  hasRevenueDistributionChangesAtom,
  hasDtfRevenueChangesAtom,
  hasAuctionLengthChangeAtom,
  hasGovernanceChangesAtom,
} from '../atoms'
import RemovedTokensChanges from './changes/removed-tokens-changes'
import MandateChanges from './changes/mandate-changes'
import RoleChanges from './changes/role-changes'
import RevenueChanges from './changes/revenue-changes'
import AuctionSettingsChanges from './changes/auction-settings-changes'
import GovernanceChanges from './changes/governance-changes'

const DTFSettingsProposalChanges = () => {
  const removedBasketTokens = useAtomValue(removedBasketTokensAtom)
  const hasMandateChange = useAtomValue(hasMandateChangeAtom)
  const hasRolesChanges = useAtomValue(hasRolesChangesAtom)
  const hasRevenueDistributionChanges = useAtomValue(
    hasRevenueDistributionChangesAtom
  )
  const hasDtfRevenueChanges = useAtomValue(hasDtfRevenueChangesAtom)
  const hasAuctionLengthChange = useAtomValue(hasAuctionLengthChangeAtom)
  const hasGovernanceChanges = useAtomValue(hasGovernanceChangesAtom)

  const hasAnyChanges =
    removedBasketTokens.length > 0 ||
    hasMandateChange ||
    hasRolesChanges ||
    hasRevenueDistributionChanges ||
    hasDtfRevenueChanges ||
    hasAuctionLengthChange ||
    hasGovernanceChanges

  if (!hasAnyChanges) {
    return <div className="p-6 text-center text-legend">No changes</div>
  }

  return (
    <div className="space-y-4">
      <MandateChanges />
      <RoleChanges />
      <RevenueChanges />
      <AuctionSettingsChanges />
      <GovernanceChanges />
      <RemovedTokensChanges />
    </div>
  )
}

export default DTFSettingsProposalChanges
