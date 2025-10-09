import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { Address } from 'viem'
import {
  resetAtom,
  daoGovernanceChangesAtom,
  rolesChangesAtom,
  isFormValidAtom,
  isProposalConfirmedAtom,
  currentQuorumPercentageAtom,
} from './atoms'
import { proposalThresholdToPercentage, secondsToDays } from '../../shared'

const Updater = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const reset = useSetAtom(resetAtom)
  const { reset: resetForm, watch, formState } = useFormContext()
  const governanceChanges = useAtomValue(daoGovernanceChangesAtom)
  const isProposalConfirmed = useAtomValue(isProposalConfirmedAtom)
  const currentQuorumPercentage = useAtomValue(currentQuorumPercentageAtom)
  const isResettingForm = useRef(false)

  // Set atoms for changes
  const setGovernanceChanges = useSetAtom(daoGovernanceChangesAtom)
  const setRolesChanges = useSetAtom(rolesChangesAtom)
  const setIsFormValid = useSetAtom(isFormValidAtom)

  // Watch form fields
  const daoVotingDelay = watch('daoVotingDelay')
  const daoVotingPeriod = watch('daoVotingPeriod')
  const daoVotingThreshold = watch('daoVotingThreshold')
  const daoVotingQuorum = watch('daoVotingQuorum')
  const daoExecutionDelay = watch('daoExecutionDelay')
  const guardians = watch('guardians')

  useEffect(() => {
    if (indexDTF && indexDTF.stToken?.governance) {
      isResettingForm.current = true

      const governance = indexDTF.stToken.governance

      // Get current governance values
      const currentVotingDelay = secondsToDays(Number(governance.votingDelay))
      const currentVotingPeriod = secondsToDays(Number(governance.votingPeriod))
      const currentThreshold = proposalThresholdToPercentage(
        governance.proposalThreshold
      )
      const currentExecutionDelay = secondsToDays(
        Number(governance.timelock.executionDelay)
      )

      // Get current guardians
      const currentGuardians = governance.timelock?.guardians || []

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
            : currentQuorumPercentage,
        daoVotingThreshold:
          governanceChanges.proposalThreshold !== undefined
            ? governanceChanges.proposalThreshold
            : currentThreshold,
        daoExecutionDelay:
          governanceChanges.executionDelay !== undefined
            ? governanceChanges.executionDelay / 86400
            : currentExecutionDelay,
        guardians: currentGuardians,
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
          const newValueInSeconds = Math.round(daoVotingDelay * 86400)
          if (newValueInSeconds !== Number(governance.votingDelay)) {
            changes.votingDelay = newValueInSeconds
          } else {
            delete changes.votingDelay
          }
        }

        // Check voting period (convert from days to seconds for comparison)
        if (daoVotingPeriod !== undefined) {
          const newValueInSeconds = Math.round(daoVotingPeriod * 86400)
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
          if (daoVotingQuorum !== currentQuorumPercentage) {
            changes.quorumPercent = daoVotingQuorum
          } else {
            delete changes.quorumPercent
          }
        }

        // Check execution delay (convert from days to seconds for comparison)
        if (daoExecutionDelay !== undefined) {
          const newValueInSeconds = Math.round(daoExecutionDelay * 86400)
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
    currentQuorumPercentage,
  ])

  // Watch for guardian role changes
  useEffect(() => {
    if (indexDTF && indexDTF.stToken?.governance?.timelock) {
      const currentGuardians = indexDTF.stToken.governance.timelock.guardians || []
      
      // Filter out empty strings and convert to addresses
      const formGuardians = (guardians || [])
        .filter((g: string) => g && g.trim() !== '')
        .map((g: string) => g as Address)
      
      // Check if guardians have changed
      const hasChanged = (() => {
        if (formGuardians.length !== currentGuardians.length) return true
        
        const formSet = new Set(formGuardians.map((g: string) => g.toLowerCase()))
        const currentSet = new Set(currentGuardians.map((g: string) => g.toLowerCase()))
        
        for (const guardian of formGuardians) {
          if (!currentSet.has(guardian.toLowerCase())) return true
        }
        
        for (const guardian of currentGuardians) {
          if (!formSet.has(guardian.toLowerCase())) return true
        }
        
        return false
      })()
      
      setRolesChanges((prevChanges) => {
        if (hasChanged) {
          return { ...prevChanges, guardians: formGuardians }
        } else {
          const { guardians: _, ...rest } = prevChanges
          return rest
        }
      })
    }
  }, [guardians, indexDTF?.stToken?.governance?.timelock, setRolesChanges])

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
