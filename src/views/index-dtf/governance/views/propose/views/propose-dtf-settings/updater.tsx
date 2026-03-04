import dtfIndexAbiV5 from '@/abis/dtf-index-abi'
import {
  indexDTFAtom,
  indexDTFRebalanceControlAtom,
  indexDTFVersionAtom,
} from '@/state/dtf/atoms'
import { getPlatformFee } from '@/utils/constants'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { chainIdAtom } from '@/state/atoms'
import { useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useReadContract } from 'wagmi'
import {
  feeRecipientsAtom,
  isProposalConfirmedAtom,
  proposalDescriptionAtom,
  removedBasketTokensAtom,
  selectedSectionAtom,
  tokenNameChangeAtom,
  mandateChangeAtom,
  rolesChangesAtom,
  revenueDistributionChangesAtom,
  dtfRevenueChangesAtom,
  auctionLengthChangeAtom,
  weightControlChangeAtom,
  bidsEnabledChangeAtom,
  governanceChangesAtom,
  isFormValidAtom,
  currentQuorumPercentageAtom,
} from './atoms'
import { proposalThresholdToPercentage, secondsToDays } from '../../shared'

const resetAtom = atom(null, (get, set) => {
  set(removedBasketTokensAtom, [])
  set(selectedSectionAtom, undefined)
  set(isProposalConfirmedAtom, false)
  set(proposalDescriptionAtom, undefined)
  set(tokenNameChangeAtom, undefined)
  set(mandateChangeAtom, undefined)
  set(rolesChangesAtom, {})
  set(revenueDistributionChangesAtom, {})
  set(dtfRevenueChangesAtom, {})
  set(auctionLengthChangeAtom, undefined)
  set(weightControlChangeAtom, undefined)
  set(bidsEnabledChangeAtom, undefined)
  set(governanceChangesAtom, {})
})

const Updater = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const feeRecipients = useAtomValue(feeRecipientsAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const version = useAtomValue(indexDTFVersionAtom)
  const chainId = useAtomValue(chainIdAtom)
  const isV5 = version.startsWith('5')

  // Read bidsEnabled from contract (v5+ only)
  const { data: currentBidsEnabled } = useReadContract({
    abi: dtfIndexAbiV5,
    address: indexDTF?.id,
    functionName: 'bidsEnabled',
    chainId: indexDTF?.chainId,
    query: {
      enabled: !!indexDTF?.id && isV5,
    },
  })
  const reset = useSetAtom(resetAtom)
  const { reset: resetForm, watch, formState, control } = useFormContext()
  const governanceChanges = useAtomValue(governanceChangesAtom)
  const tokenNameChange = useAtomValue(tokenNameChangeAtom)
  const mandateChange = useAtomValue(mandateChangeAtom)
  const rolesChanges = useAtomValue(rolesChangesAtom)
  const revenueDistributionChanges = useAtomValue(
    revenueDistributionChangesAtom
  )
  const dtfRevenueChanges = useAtomValue(dtfRevenueChangesAtom)
  const auctionLengthChange = useAtomValue(auctionLengthChangeAtom)
  const weightControlChange = useAtomValue(weightControlChangeAtom)
  const bidsEnabledChange = useAtomValue(bidsEnabledChangeAtom)
  const currentQuorumPercentage = useAtomValue(currentQuorumPercentageAtom)
  const isResettingForm = useRef(false)

  // Set atoms for changes
  const setTokenNameChange = useSetAtom(tokenNameChangeAtom)
  const setMandateChange = useSetAtom(mandateChangeAtom)
  const setRolesChanges = useSetAtom(rolesChangesAtom)
  const setRevenueDistributionChanges = useSetAtom(
    revenueDistributionChangesAtom
  )
  const setDtfRevenueChanges = useSetAtom(dtfRevenueChangesAtom)
  const setAuctionLengthChange = useSetAtom(auctionLengthChangeAtom)
  const setWeightControlChange = useSetAtom(weightControlChangeAtom)
  const setBidsEnabledChange = useSetAtom(bidsEnabledChangeAtom)
  const setGovernanceChanges = useSetAtom(governanceChangesAtom)
  const setIsFormValid = useSetAtom(isFormValidAtom)

  // Watch form fields
  const tokenName = watch('tokenName')
  const mandate = watch('mandate')
  const mintFee = watch('mintFee')
  const folioFee = watch('folioFee')
  const governanceShare = watch('governanceShare')
  const deployerShare = watch('deployerShare')
  const auctionLength = watch('auctionLength')
  const weightControl = watch('weightControl')
  const bidsEnabled = watch('bidsEnabled')
  const governanceVotingDelay = watch('governanceVotingDelay')
  const governanceVotingPeriod = watch('governanceVotingPeriod')
  const governanceVotingThreshold = watch('governanceVotingThreshold')
  const governanceVotingQuorum = watch('governanceVotingQuorum')
  const governanceExecutionDelay = watch('governanceExecutionDelay')

  // Use useWatch for arrays to ensure updates are captured immediately
  const guardians = useWatch({
    name: 'guardians',
    control,
  })
  const brandManagers = useWatch({
    name: 'brandManagers',
    control,
  })
  const auctionLaunchers = useWatch({
    name: 'auctionLaunchers',
    control,
  })
  const additionalRevenueRecipients = useWatch({
    name: 'additionalRevenueRecipients',
    control,
  })

  useEffect(() => {
    if (indexDTF && indexDTF.ownerGovernance && feeRecipients) {
      isResettingForm.current = true

      // Get current governance values
      const currentVotingDelay = secondsToDays(
        Number(indexDTF.ownerGovernance.votingDelay)
      )
      const currentVotingPeriod = secondsToDays(
        Number(indexDTF.ownerGovernance.votingPeriod)
      )
      const currentThreshold = proposalThresholdToPercentage(
        indexDTF.ownerGovernance.proposalThreshold
      )
      const currentExecutionDelay = secondsToDays(
        Number(indexDTF.ownerGovernance.timelock.executionDelay)
      )

      resetForm({
        tokenName:
          tokenNameChange !== undefined
            ? tokenNameChange
            : indexDTF.token.name,
        mandate: mandateChange !== undefined ? mandateChange : indexDTF.mandate,
        governanceVoteLock: indexDTF.stToken?.id,
        mintFee:
          dtfRevenueChanges.mintFee !== undefined
            ? dtfRevenueChanges.mintFee
            : indexDTF.mintingFee * 100,
        folioFee:
          dtfRevenueChanges.tvlFee !== undefined
            ? dtfRevenueChanges.tvlFee
            : indexDTF.annualizedTvlFee * 100,
        governanceShare:
          revenueDistributionChanges.governanceShare !== undefined
            ? revenueDistributionChanges.governanceShare
            : feeRecipients.governanceShare,
        deployerShare:
          revenueDistributionChanges.deployerShare !== undefined
            ? revenueDistributionChanges.deployerShare
            : feeRecipients.deployerShare,
        additionalRevenueRecipients:
          revenueDistributionChanges.additionalRecipients !== undefined
            ? revenueDistributionChanges.additionalRecipients
            : feeRecipients.externalRecipients,
        fixedPlatformFee: getPlatformFee(chainId),
        auctionLength:
          auctionLengthChange !== undefined
            ? auctionLengthChange
            : indexDTF.auctionLength / 60,
        weightControl:
          weightControlChange !== undefined
            ? weightControlChange
            : rebalanceControl?.weightControl ?? true,
        bidsEnabled:
          bidsEnabledChange !== undefined
            ? bidsEnabledChange
            : currentBidsEnabled ?? true,
        // Apply governance changes if they exist, otherwise use current values
        governanceVotingDelay:
          governanceChanges.votingDelay !== undefined
            ? governanceChanges.votingDelay / 86400
            : currentVotingDelay,
        governanceVotingPeriod:
          governanceChanges.votingPeriod !== undefined
            ? governanceChanges.votingPeriod / 86400
            : currentVotingPeriod,
        governanceVotingQuorum:
          governanceChanges.quorumPercent !== undefined
            ? governanceChanges.quorumPercent
            : currentQuorumPercentage,
        governanceVotingThreshold:
          governanceChanges.proposalThreshold !== undefined
            ? governanceChanges.proposalThreshold
            : currentThreshold,
        governanceExecutionDelay:
          governanceChanges.executionDelay !== undefined
            ? governanceChanges.executionDelay / 86400
            : currentExecutionDelay,
        guardians:
          rolesChanges.guardians !== undefined
            ? rolesChanges.guardians
            : indexDTF.ownerGovernance.timelock.guardians,
        brandManagers:
          rolesChanges.brandManagers !== undefined
            ? rolesChanges.brandManagers
            : indexDTF.brandManagers,
        auctionLaunchers:
          rolesChanges.auctionLaunchers !== undefined
            ? rolesChanges.auctionLaunchers
            : indexDTF.auctionLaunchers,
      })

      // Reset the flag after form reset
      setTimeout(() => {
        isResettingForm.current = false
      }, 100)
    }
  }, [indexDTF?.id, !!feeRecipients, currentBidsEnabled])

  // Watch for token name changes (v5+ only)
  useEffect(() => {
    if (indexDTF && tokenName !== undefined && isV5) {
      if (tokenName !== indexDTF.token.name) {
        setTokenNameChange(tokenName)
      } else {
        setTokenNameChange(undefined)
      }
    }
  }, [tokenName, indexDTF?.token.name, isV5])

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

  // Watch for weight control changes
  useEffect(() => {
    if (rebalanceControl && weightControl !== undefined) {
      if (weightControl !== rebalanceControl.weightControl) {
        setWeightControlChange(weightControl)
      } else {
        setWeightControlChange(undefined)
      }
    }
  }, [weightControl, rebalanceControl?.weightControl])

  // Watch for bids enabled changes (v5+ only)
  useEffect(() => {
    if (isV5 && bidsEnabled !== undefined && currentBidsEnabled !== undefined) {
      if (bidsEnabled !== currentBidsEnabled) {
        setBidsEnabledChange(bidsEnabled)
      } else {
        setBidsEnabledChange(undefined)
      }
    }
  }, [bidsEnabled, currentBidsEnabled, isV5])

  // Watch for governance changes
  useEffect(() => {
    if (indexDTF && indexDTF.ownerGovernance) {
      const governance = indexDTF.ownerGovernance

      setGovernanceChanges((prevChanges) => {
        const changes = { ...prevChanges }

        // Check voting delay (convert from days to seconds for comparison)
        if (governanceVotingDelay !== undefined) {
          const newValueInSeconds = Math.round(governanceVotingDelay * 86400)
          if (newValueInSeconds !== Number(governance.votingDelay)) {
            changes.votingDelay = newValueInSeconds
          } else {
            delete changes.votingDelay
          }
        }

        // Check voting period (convert from days to seconds for comparison)
        if (governanceVotingPeriod !== undefined) {
          const newValueInSeconds = Math.round(governanceVotingPeriod * 86400)
          if (newValueInSeconds !== Number(governance.votingPeriod)) {
            changes.votingPeriod = newValueInSeconds
          } else {
            delete changes.votingPeriod
          }
        }

        // Check proposal threshold (convert to percentage for comparison)
        if (governanceVotingThreshold !== undefined) {
          const currentThreshold = proposalThresholdToPercentage(
            governance.proposalThreshold
          )
          if (governanceVotingThreshold !== currentThreshold) {
            changes.proposalThreshold = governanceVotingThreshold
          } else {
            delete changes.proposalThreshold
          }
        }

        // Check voting quorum
        if (governanceVotingQuorum !== undefined) {
          if (governanceVotingQuorum !== currentQuorumPercentage) {
            changes.quorumPercent = governanceVotingQuorum
          } else {
            delete changes.quorumPercent
          }
        }

        // Check execution delay (convert from days to seconds for comparison)
        if (governanceExecutionDelay !== undefined) {
          const newValueInSeconds = Math.round(governanceExecutionDelay * 86400)
          if (
            governance.timelock?.executionDelay !== undefined &&
            newValueInSeconds !== Number(governance.timelock.executionDelay)
          ) {
            changes.executionDelay = newValueInSeconds
          } else {
            delete changes.executionDelay
          }
        }

        return changes
      })
    }
  }, [
    governanceVotingDelay,
    governanceVotingPeriod,
    governanceVotingThreshold,
    governanceVotingQuorum,
    governanceExecutionDelay,
    indexDTF?.ownerGovernance,
    setGovernanceChanges,
    currentQuorumPercentage,
  ])

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
