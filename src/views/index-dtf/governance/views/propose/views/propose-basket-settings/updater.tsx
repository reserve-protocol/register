import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  resetAtom,
  basketGovernanceChangesAtom,
  isFormValidAtom,
  isProposalConfirmedAtom,
} from './atoms'
import { proposalThresholdToPercentage, secondsToDays } from '../../shared'

const Updater = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const reset = useSetAtom(resetAtom)
  const { reset: resetForm, watch, formState } = useFormContext()
  const governanceChanges = useAtomValue(basketGovernanceChangesAtom)
  const isProposalConfirmed = useAtomValue(isProposalConfirmedAtom)
  const isResettingForm = useRef(false)

  // Set atoms for changes
  const setGovernanceChanges = useSetAtom(basketGovernanceChangesAtom)
  const setIsFormValid = useSetAtom(isFormValidAtom)

  // Watch form fields
  const basketVotingDelay = watch('basketVotingDelay')
  const basketVotingPeriod = watch('basketVotingPeriod')
  const basketVotingThreshold = watch('basketVotingThreshold')
  const basketVotingQuorum = watch('basketVotingQuorum')
  const basketExecutionDelay = watch('basketExecutionDelay')

  useEffect(() => {
    if (indexDTF && indexDTF.tradingGovernance) {
      isResettingForm.current = true

      const governance = indexDTF.tradingGovernance

      // Get current governance values
      const currentVotingDelay = secondsToDays(Number(governance.votingDelay))
      const currentVotingPeriod = secondsToDays(Number(governance.votingPeriod))
      const currentQuorum = Number(governance.quorumNumerator)
      const currentThreshold = proposalThresholdToPercentage(
        governance.proposalThreshold
      )
      const currentExecutionDelay = secondsToDays(
        Number(governance.timelock.executionDelay)
      )

      resetForm({
        // Apply governance changes if they exist, otherwise use current values
        basketVotingDelay:
          governanceChanges.votingDelay !== undefined
            ? governanceChanges.votingDelay / 86400
            : currentVotingDelay,
        basketVotingPeriod:
          governanceChanges.votingPeriod !== undefined
            ? governanceChanges.votingPeriod / 86400
            : currentVotingPeriod,
        basketVotingQuorum:
          governanceChanges.quorumPercent !== undefined
            ? governanceChanges.quorumPercent
            : currentQuorum,
        basketVotingThreshold:
          governanceChanges.proposalThreshold !== undefined
            ? governanceChanges.proposalThreshold
            : currentThreshold,
        basketExecutionDelay:
          governanceChanges.executionDelay !== undefined
            ? governanceChanges.executionDelay / 86400
            : currentExecutionDelay,
      })

      // Reset the flag after form reset
      setTimeout(() => {
        isResettingForm.current = false
      }, 100)
    }
  }, [indexDTF?.tradingGovernance?.id])

  // Watch for governance changes
  useEffect(() => {
    if (indexDTF && indexDTF.tradingGovernance) {
      const governance = indexDTF.tradingGovernance

      setGovernanceChanges((prevChanges) => {
        const changes = { ...prevChanges }

        // Check voting delay (convert from days to seconds for comparison)
        if (basketVotingDelay !== undefined) {
          const newValueInSeconds = basketVotingDelay * 86400
          if (newValueInSeconds !== Number(governance.votingDelay)) {
            changes.votingDelay = newValueInSeconds
          } else {
            delete changes.votingDelay
          }
        }

        // Check voting period (convert from days to seconds for comparison)
        if (basketVotingPeriod !== undefined) {
          const newValueInSeconds = basketVotingPeriod * 86400
          if (newValueInSeconds !== Number(governance.votingPeriod)) {
            changes.votingPeriod = newValueInSeconds
          } else {
            delete changes.votingPeriod
          }
        }

        // Check proposal threshold (convert to percentage for comparison)
        if (basketVotingThreshold !== undefined) {
          const currentThreshold = Number(governance.proposalThreshold) / 1e18
          if (basketVotingThreshold !== currentThreshold) {
            changes.proposalThreshold = basketVotingThreshold
          } else {
            delete changes.proposalThreshold
          }
        }

        // Check voting quorum
        if (basketVotingQuorum !== undefined) {
          if (basketVotingQuorum !== Number(governance.quorumNumerator)) {
            changes.quorumPercent = basketVotingQuorum
          } else {
            delete changes.quorumPercent
          }
        }

        // Check execution delay (convert from days to seconds for comparison)
        if (basketExecutionDelay !== undefined) {
          const newValueInSeconds = basketExecutionDelay * 86400
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
    basketVotingDelay,
    basketVotingPeriod,
    basketVotingThreshold,
    basketVotingQuorum,
    basketExecutionDelay,
    indexDTF?.tradingGovernance,
    setGovernanceChanges,
  ])

  // Track form validation state
  useEffect(() => {
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
