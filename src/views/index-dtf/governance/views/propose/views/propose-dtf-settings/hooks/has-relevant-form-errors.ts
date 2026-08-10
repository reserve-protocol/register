import type { FieldError, FieldErrors } from 'react-hook-form'
import type { ProposeSettings } from '../form-fields'

type SettingsErrors = FieldErrors<ProposeSettings> & {
  optimistic?: FieldError
  roles?: FieldError
  'revenue-distribution'?: FieldError
}

export type RelevantFormChanges = {
  tokenNameChange?: unknown
  mandateChange?: unknown
  rolesChanges: {
    guardians?: unknown
    brandManagers?: unknown
    auctionLaunchers?: unknown
  }
  revenueDistributionChanges: {
    governanceShare?: unknown
    deployerShare?: unknown
    additionalRecipients?: unknown
  }
  dtfRevenueChanges: { mintFee?: unknown; tvlFee?: unknown }
  auctionLengthChange?: unknown
  weightControlChange?: unknown
  bidsEnabledChange?: unknown
  governanceChanges: {
    votingDelay?: unknown
    votingPeriod?: unknown
    quorumPercent?: unknown
    proposalThreshold?: unknown
    executionDelay?: unknown
  }
  optimisticChanges: {
    vetoDelay?: unknown
    vetoPeriod?: unknown
    vetoThreshold?: unknown
    optimisticProposers?: unknown
  }
}

// Seeded values can fail deploy-time validation; only changed values enter calldata.
export const hasRelevantFormErrors = (
  formErrors: FieldErrors,
  changes: RelevantFormChanges
) => {
  const errors = formErrors as SettingsErrors
  const {
    tokenNameChange,
    mandateChange,
    rolesChanges,
    revenueDistributionChanges,
    dtfRevenueChanges,
    auctionLengthChange,
    weightControlChange,
    bidsEnabledChange,
    governanceChanges,
    optimisticChanges,
  } = changes
  const hasRolesChange =
    rolesChanges.guardians !== undefined ||
    rolesChanges.brandManagers !== undefined ||
    rolesChanges.auctionLaunchers !== undefined
  const hasDistributionChange =
    revenueDistributionChanges.governanceShare !== undefined ||
    revenueDistributionChanges.deployerShare !== undefined ||
    revenueDistributionChanges.additionalRecipients !== undefined

  return Boolean(
    (tokenNameChange !== undefined && errors.tokenName) ||
    (mandateChange !== undefined && errors.mandate) ||
    (rolesChanges.guardians !== undefined && errors.guardians) ||
    (rolesChanges.brandManagers !== undefined && errors.brandManagers) ||
    (rolesChanges.auctionLaunchers !== undefined && errors.auctionLaunchers) ||
    (hasRolesChange && errors.roles) ||
    (revenueDistributionChanges.governanceShare !== undefined &&
      errors.governanceShare) ||
    (revenueDistributionChanges.deployerShare !== undefined &&
      errors.deployerShare) ||
    (revenueDistributionChanges.additionalRecipients !== undefined &&
      errors.additionalRevenueRecipients) ||
    (hasDistributionChange && errors['revenue-distribution']) ||
    (dtfRevenueChanges.mintFee !== undefined && errors.mintFee) ||
    (dtfRevenueChanges.tvlFee !== undefined && errors.folioFee) ||
    (auctionLengthChange !== undefined && errors.auctionLength) ||
    (weightControlChange !== undefined && errors.weightControl) ||
    (bidsEnabledChange !== undefined && errors.bidsEnabled) ||
    (governanceChanges.votingDelay !== undefined &&
      errors.governanceVotingDelay) ||
    (governanceChanges.votingPeriod !== undefined &&
      errors.governanceVotingPeriod) ||
    (governanceChanges.quorumPercent !== undefined &&
      errors.governanceVotingQuorum) ||
    (governanceChanges.proposalThreshold !== undefined &&
      errors.governanceVotingThreshold) ||
    (governanceChanges.executionDelay !== undefined &&
      errors.governanceExecutionDelay) ||
    (optimisticChanges.vetoDelay !== undefined && errors.optimisticVetoDelay) ||
    (optimisticChanges.vetoPeriod !== undefined &&
      errors.optimisticVetoPeriod) ||
    (optimisticChanges.vetoThreshold !== undefined &&
      errors.optimisticVetoThreshold) ||
    (optimisticChanges.optimisticProposers !== undefined &&
      (errors.optimisticProposers || errors.optimistic))
  )
}
