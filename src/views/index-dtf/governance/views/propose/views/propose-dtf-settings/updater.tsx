import { indexDTFAtom } from '@/state/dtf/atoms'
import { FIXED_PLATFORM_FEE } from '@/utils/constants'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  feeRecipientsAtom,
  isProposalConfirmedAtom,
  proposalDescriptionAtom,
  removedBasketTokensAtom,
  selectedSectionAtom,
  mandateChangeAtom,
  rolesChangesAtom,
  revenueDistributionChangesAtom,
  dtfRevenueChangesAtom,
  auctionLengthChangeAtom,
  isFormValidAtom,
} from './atoms'

const resetAtom = atom(null, (get, set) => {
  set(removedBasketTokensAtom, [])
  set(selectedSectionAtom, [])
  set(isProposalConfirmedAtom, false)
  set(proposalDescriptionAtom, undefined)
  set(mandateChangeAtom, undefined)
  set(rolesChangesAtom, {})
  set(revenueDistributionChangesAtom, {})
  set(dtfRevenueChangesAtom, {})
  set(auctionLengthChangeAtom, undefined)
})

const Updater = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const feeRecipients = useAtomValue(feeRecipientsAtom)
  const reset = useSetAtom(resetAtom)
  const { reset: resetForm, watch, formState, control } = useFormContext()

  // Set atoms for changes
  const setMandateChange = useSetAtom(mandateChangeAtom)
  const setRolesChanges = useSetAtom(rolesChangesAtom)
  const setRevenueDistributionChanges = useSetAtom(
    revenueDistributionChangesAtom
  )
  const setDtfRevenueChanges = useSetAtom(dtfRevenueChangesAtom)
  const setAuctionLengthChange = useSetAtom(auctionLengthChangeAtom)
  const setIsFormValid = useSetAtom(isFormValidAtom)

  // Watch form fields
  const mandate = watch('mandate')
  const guardians = watch('guardians')
  const brandManagers = watch('brandManagers')
  const auctionLaunchers = watch('auctionLaunchers')
  const mintFee = watch('mintFee')
  const folioFee = watch('folioFee')
  const governanceShare = watch('governanceShare')
  const deployerShare = watch('deployerShare')
  const auctionLength = watch('auctionLength')

  // Use useWatch for nested array to ensure updates are captured
  const additionalRevenueRecipients = useWatch({
    name: 'additionalRevenueRecipients',
    control,
  })

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

  // Watch for mandate changes
  useEffect(() => {
    if (indexDTF && mandate !== undefined) {
      if (mandate !== indexDTF.mandate) {
        setMandateChange(mandate)
      } else {
        setMandateChange(undefined)
      }
    }
  }, [mandate, indexDTF?.mandate])

  // Watch for role changes
  useEffect(() => {
    if (indexDTF && indexDTF.ownerGovernance) {
      const changes: any = {}

      // Check guardians
      if (
        guardians &&
        JSON.stringify(guardians.filter(Boolean).sort()) !==
          JSON.stringify(
            (indexDTF.ownerGovernance.timelock.guardians || []).sort()
          )
      ) {
        changes.guardians = guardians.filter(Boolean)
      }

      // Check brand managers
      if (
        brandManagers &&
        JSON.stringify(brandManagers.filter(Boolean).sort()) !==
          JSON.stringify((indexDTF.brandManagers || []).sort())
      ) {
        changes.brandManagers = brandManagers.filter(Boolean)
      }

      // Check auction launchers
      if (
        auctionLaunchers &&
        JSON.stringify(auctionLaunchers.filter(Boolean).sort()) !==
          JSON.stringify((indexDTF.auctionLaunchers || []).sort())
      ) {
        changes.auctionLaunchers = auctionLaunchers.filter(Boolean)
      }

      setRolesChanges(changes)
    }
  }, [guardians, brandManagers, auctionLaunchers, indexDTF?.id])

  // Watch for fee changes
  useEffect(() => {
    if (indexDTF) {
      setDtfRevenueChanges((prevChanges) => {
        const changes = { ...prevChanges }

        if (mintFee !== undefined && mintFee !== indexDTF.mintingFee * 100) {
          changes.mintFee = mintFee
        } else {
          delete changes.mintFee
        }

        if (
          folioFee !== undefined &&
          folioFee !== indexDTF.annualizedTvlFee * 100
        ) {
          changes.tvlFee = folioFee
        } else {
          delete changes.tvlFee
        }

        return changes
      })
    }
  }, [mintFee, folioFee, indexDTF?.mintingFee, indexDTF?.annualizedTvlFee])

  // Watch for revenue distribution changes
  useEffect(() => {
    if (feeRecipients) {
      // Update governance share
      if (governanceShare !== undefined) {
        // Compare as numbers, handling edge cases
        const current = Number(feeRecipients.governanceShare)
        const newVal = Number(governanceShare)

        if (!isNaN(current) && !isNaN(newVal) && current !== newVal) {
          setRevenueDistributionChanges((prev) => ({
            ...prev,
            governanceShare: newVal,
          }))
        } else if (governanceShare !== feeRecipients.governanceShare) {
          // Fallback to direct comparison if number conversion fails
          setRevenueDistributionChanges((prev) => ({
            ...prev,
            governanceShare,
          }))
        } else {
          setRevenueDistributionChanges((prev) => {
            const { governanceShare, ...rest } = prev
            return rest
          })
        }
      }

      // Update deployer share
      if (deployerShare !== undefined) {
        // Compare as numbers, handling edge cases
        const current = Number(feeRecipients.deployerShare)
        const newVal = Number(deployerShare)

        if (!isNaN(current) && !isNaN(newVal) && current !== newVal) {
          setRevenueDistributionChanges((prev) => ({
            ...prev,
            deployerShare: newVal,
          }))
        } else if (deployerShare !== feeRecipients.deployerShare) {
          // Fallback to direct comparison if number conversion fails
          setRevenueDistributionChanges((prev) => ({ ...prev, deployerShare }))
        } else {
          setRevenueDistributionChanges((prev) => {
            const { deployerShare, ...rest } = prev
            return rest
          })
        }
      }

      // Update additional recipients
      if (additionalRevenueRecipients !== undefined) {
        const hasChanged =
          JSON.stringify(additionalRevenueRecipients) !==
          JSON.stringify(feeRecipients.externalRecipients)
        if (hasChanged) {
          setRevenueDistributionChanges((prev) => ({
            ...prev,
            additionalRecipients: additionalRevenueRecipients,
          }))
        } else {
          setRevenueDistributionChanges((prev) => {
            const { additionalRecipients, ...rest } = prev
            return rest
          })
        }
      }
    }
  }, [
    governanceShare,
    deployerShare,
    additionalRevenueRecipients,
    feeRecipients,
    setRevenueDistributionChanges,
  ])

  // Watch for auction length changes
  useEffect(() => {
    if (indexDTF && auctionLength !== undefined) {
      if (auctionLength !== indexDTF.auctionLength / 60) {
        setAuctionLengthChange(auctionLength)
      } else {
        setAuctionLengthChange(undefined)
      }
    }
  }, [auctionLength, indexDTF?.auctionLength])

  // Track form validation state
  useEffect(() => {
    console.log('formState.isValid', formState.errors)
    setIsFormValid(formState.isValid)
  }, [formState.isValid, setIsFormValid])

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  return null
}

export default Updater
