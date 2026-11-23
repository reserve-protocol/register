import { useAtomValue } from 'jotai'
import type { FieldErrors } from 'react-hook-form'
import {
  auctionLengthChangeAtom,
  bidsEnabledChangeAtom,
  dtfRevenueChangesAtom,
  governanceChangesAtom,
  mandateChangeAtom,
  optimisticGovernanceChangesAtom,
  revenueDistributionChangesAtom,
  rolesChangesAtom,
  selfFeeChangeAtom,
  tokenNameChangeAtom,
  weightControlChangeAtom,
} from '../atoms'
import { hasRelevantFormErrors } from './has-relevant-form-errors'

export const useHasRelevantFormErrors = (formErrors: FieldErrors) =>
  hasRelevantFormErrors(formErrors, {
    tokenNameChange: useAtomValue(tokenNameChangeAtom),
    mandateChange: useAtomValue(mandateChangeAtom),
    rolesChanges: useAtomValue(rolesChangesAtom),
    revenueDistributionChanges: useAtomValue(revenueDistributionChangesAtom),
    dtfRevenueChanges: useAtomValue(dtfRevenueChangesAtom),
    auctionLengthChange: useAtomValue(auctionLengthChangeAtom),
    weightControlChange: useAtomValue(weightControlChangeAtom),
    bidsEnabledChange: useAtomValue(bidsEnabledChangeAtom),
    selfFeeChange: useAtomValue(selfFeeChangeAtom),
    governanceChanges: useAtomValue(governanceChangesAtom),
    optimisticChanges: useAtomValue(optimisticGovernanceChangesAtom),
  })
