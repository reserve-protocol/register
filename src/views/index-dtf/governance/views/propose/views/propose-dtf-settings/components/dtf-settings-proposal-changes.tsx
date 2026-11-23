import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import {
  removedBasketTokensAtom,
  hasTokenNameChangeAtom,
  hasMandateChangeAtom,
  hasRolesChangesAtom,
  hasRevenueDistributionChangesAtom,
  hasDtfRevenueChangesAtom,
  hasAuctionLengthChangeAtom,
  hasWeightControlChangeAtom,
  hasBidsEnabledChangeAtom,
  hasGovernanceChangesAtom,
  hasOptimisticGovernanceChangesAtom,
  hasSelfFeeChangeAtom,
  hasTradeAllowlistChangesAtom,
} from '../atoms'
import RemovedTokensChanges from './changes/removed-tokens-changes'
import BasicsChanges from './changes/basics-changes'
import RoleChanges from './changes/role-changes'
import RevenueChanges from './changes/revenue-changes'
import AuctionSettingsChanges from './changes/auction-settings-changes'
import GovernanceChanges from './changes/governance-changes'
import OptimisticGovernanceChanges from './changes/optimistic-governance-changes'
import V6SettingsChanges from './changes/v6-settings-changes'

const DTFSettingsProposalChanges = () => {
  const removedBasketTokens = useAtomValue(removedBasketTokensAtom)
  const hasTokenNameChange = useAtomValue(hasTokenNameChangeAtom)
  const hasMandateChange = useAtomValue(hasMandateChangeAtom)
  const hasRolesChanges = useAtomValue(hasRolesChangesAtom)
  const hasRevenueDistributionChanges = useAtomValue(
    hasRevenueDistributionChangesAtom
  )
  const hasDtfRevenueChanges = useAtomValue(hasDtfRevenueChangesAtom)
  const hasAuctionLengthChange = useAtomValue(hasAuctionLengthChangeAtom)
  const hasWeightControlChange = useAtomValue(hasWeightControlChangeAtom)
  const hasBidsEnabledChange = useAtomValue(hasBidsEnabledChangeAtom)
  const hasGovernanceChanges = useAtomValue(hasGovernanceChangesAtom)
  const hasOptimisticGovernanceChanges = useAtomValue(
    hasOptimisticGovernanceChangesAtom
  )
  const hasSelfFeeChange = useAtomValue(hasSelfFeeChangeAtom)
  const hasTradeAllowlistChanges = useAtomValue(hasTradeAllowlistChangesAtom)

  const hasAnyChanges =
    removedBasketTokens.length > 0 ||
    hasTokenNameChange ||
    hasMandateChange ||
    hasRolesChanges ||
    hasRevenueDistributionChanges ||
    hasDtfRevenueChanges ||
    hasAuctionLengthChange ||
    hasWeightControlChange ||
    hasBidsEnabledChange ||
    hasGovernanceChanges ||
    hasOptimisticGovernanceChanges ||
    hasSelfFeeChange ||
    hasTradeAllowlistChanges

  if (!hasAnyChanges) {
    return (
      <div className="p-6 text-center text-legend">
        <Trans>No changes</Trans>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <BasicsChanges />
      <RoleChanges />
      <RevenueChanges />
      <AuctionSettingsChanges />
      <V6SettingsChanges />
      <GovernanceChanges />
      <OptimisticGovernanceChanges />
      <RemovedTokensChanges />
    </div>
  )
}

export default DTFSettingsProposalChanges
