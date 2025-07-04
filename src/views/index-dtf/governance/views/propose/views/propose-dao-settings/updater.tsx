import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  resetAtom,
  daoGovernanceChangesAtom,
  isFormValidAtom,
  isProposalConfirmedAtom,
} from './atoms'
import { proposalThresholdToPercentage, secondsToDays } from '../../shared'

const Updater = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const reset = useSetAtom(resetAtom)
  const { reset: resetForm, watch, formState } = useFormContext()
  const governanceChanges = useAtomValue(daoGovernanceChangesAtom)
  const isProposalConfirmed = useAtomValue(isProposalConfirmedAtom)
  const isResettingForm = useRef(false)

  // Set atoms for changes
  const setGovernanceChanges = useSetAtom(daoGovernanceChangesAtom)
  const setIsFormValid = useSetAtom(isFormValidAtom)

  // Watch form fields
  const daoVotingDelay = watch('daoVotingDelay')
  const daoVotingPeriod = watch('daoVotingPeriod')
  const daoVotingThreshold = watch('daoVotingThreshold')
  const daoVotingQuorum = watch('daoVotingQuorum')
  const daoExecutionDelay = watch('daoExecutionDelay')

  useEffect(() => {
    if (indexDTF && indexDTF.stToken?.governance) {
      isResettingForm.current = true

      const governance = indexDTF.stToken.governance

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
        daoVotingDelay:
          governanceChanges.votingDelay !== undefined
            ? governanceChanges.votingDelay / 86400
            : currentVotingDelay,
        daoVotingPeriod:
          governanceChanges.votingPeriod !== undefined
            ? governanceChanges.votingPeriod / 86400
            : currentVotingPeriod,
        daoVotingQuorum:
          governanceChanges.quorumPercent !== undefined
            ? governanceChanges.quorumPercent
            : currentQuorum,
        daoVotingThreshold:
          governanceChanges.proposalThreshold !== undefined
            ? governanceChanges.proposalThreshold
            : currentThreshold,
        daoExecutionDelay:
          governanceChanges.executionDelay !== undefined
            ? governanceChanges.executionDelay / 86400
            : currentExecutionDelay,
      })

      // Reset the flag after form reset
      setTimeout(() => {
        isResettingForm.current = false
      }, 100)
    }
  }, [indexDTF?.stToken?.governance?.id])

  // Watch for governance changes
  useEffect(() => {
    if (indexDTF && indexDTF.stToken?.governance) {
      const governance = indexDTF.stToken.governance

      setGovernanceChanges((prevChanges) => {
        const changes = { ...prevChanges }

        // Check voting delay (convert from days to seconds for comparison)
        if (daoVotingDelay !== undefined) {
          const newValueInSeconds = daoVotingDelay * 86400
          if (newValueInSeconds !== Number(governance.votingDelay)) {
            changes.votingDelay = newValueInSeconds
          } else {
            delete changes.votingDelay
          }
        }

        // Check voting period (convert from days to seconds for comparison)
        if (daoVotingPeriod !== undefined) {
          const newValueInSeconds = daoVotingPeriod * 86400
          if (newValueInSeconds !== Number(governance.votingPeriod)) {
            changes.votingPeriod = newValueInSeconds
          } else {
            delete changes.votingPeriod
          }
        }

        // Check proposal threshold (convert to percentage for comparison)
        if (daoVotingThreshold !== undefined) {
          const currentThreshold = proposalThresholdToPercentage(
            governance.proposalThreshold
          )
          if (daoVotingThreshold !== currentThreshold) {
            changes.proposalThreshold = daoVotingThreshold
          } else {
            delete changes.proposalThreshold
          }
        }

        // Check voting quorum
        if (daoVotingQuorum !== undefined) {
          if (daoVotingQuorum !== Number(governance.quorumNumerator)) {
            changes.quorumPercent = daoVotingQuorum
          } else {
            delete changes.quorumPercent
          }
        }

        // Check execution delay (convert from days to seconds for comparison)
        if (daoExecutionDelay !== undefined) {
          const newValueInSeconds = daoExecutionDelay * 86400
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
    daoVotingDelay,
    daoVotingPeriod,
    daoVotingThreshold,
    daoVotingQuorum,
    daoExecutionDelay,
    indexDTF?.stToken?.governance,
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
