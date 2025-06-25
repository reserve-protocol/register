import { indexDTFAtom } from '@/state/dtf/atoms'
import { FIXED_PLATFORM_FEE } from '@/utils/constants'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  feeRecipientsAtom,
  isProposalConfirmedAtom,
  proposalDescriptionAtom,
  removedBasketTokensAtom,
  selectedSectionAtom,
} from './atoms'

const resetAtom = atom(null, (get, set) => {
  set(removedBasketTokensAtom, [])
  set(selectedSectionAtom, [])
  set(isProposalConfirmedAtom, false)
  set(proposalDescriptionAtom, undefined)
})

const Updater = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const feeRecipients = useAtomValue(feeRecipientsAtom)
  const reset = useSetAtom(resetAtom)
  const { reset: resetForm } = useFormContext()

  useEffect(() => {
    if (indexDTF && indexDTF.ownerGovernance && feeRecipients) {
      resetForm({
        mandate: indexDTF.mandate,
        governanceVoteLock: indexDTF.stToken?.id,
        mintFee: indexDTF.mintingFee * 100,
        folioFee: indexDTF.annualizedTvlFee * 100,
        governanceShare: feeRecipients.governanceShare,
        deployerShare: feeRecipients.deployerShare,
        additionalRevenueRecipients: feeRecipients.externalRecipients,
        fixedPlatformFee: FIXED_PLATFORM_FEE,
        auctionLength: indexDTF.auctionLength / 60,
        governanceVotingDelay: indexDTF.ownerGovernance.votingDelay,
        governanceVotingPeriod: indexDTF.ownerGovernance.votingPeriod,
        governanceVotingQuorum: indexDTF.ownerGovernance.quorumNumerator,
        governanceVotingThreshold: indexDTF.ownerGovernance.proposalThreshold,
        governanceExecutionDelay:
          indexDTF.ownerGovernance.timelock.executionDelay,
        guardians: indexDTF.ownerGovernance.timelock.guardians,
        brandManagers: indexDTF.brandManagers,
        auctionLaunchers: indexDTF.auctionLaunchers,
      })
    }
  }, [indexDTF?.id, !!feeRecipients])

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  return null
}

export default Updater
