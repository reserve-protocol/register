import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { rTokenConfigurationAtom, rTokenGovernanceAtom } from 'state/atoms'
import {
  isAssistedUpgradeAtom,
  isNewBasketProposedAtom,
  isProposalEditingAtom,
  proposalDescriptionAtom,
  proposedRolesAtom,
  spellUpgradeAtom,
} from './atoms'
import ConfirmProposal from './components/ConfirmProposal'
import Proposal from './components/Proposal'
import Updater from './updater'
import { Box } from 'theme-ui'
import { keccak256, stringToBytes } from 'viem'

const paramsAtom = atom((get) => {
  const config = get(rTokenConfigurationAtom)
  const governance = get(rTokenGovernanceAtom)

  if (!config || !governance.executionDelay) {
    return null
  }

  return {
    ...config,
    votingDelay: governance.votingDelay,
    votingPeriod: governance.votingPeriod,
    minDelay: +governance.executionDelay / 60 / 60,
    proposalThresholdAsMicroPercent: governance.proposalThreshold,
    quorumPercent: governance.quorumNumerator,
  }
})

const GovernanceProposal = () => {
  const tokenParameters = useAtomValue(paramsAtom)
  const isAssistedUpgrade = useAtomValue(isAssistedUpgradeAtom)
  const [isEditing, setEditing] = useAtom(isProposalEditingAtom)

  // This is a hash of the token parameters to avoid resetting the form more than once
  const [lastTokenParametersHash, setLastTokenParametersHash] =
    useState<string>()

  const form = useForm({
    mode: 'onChange',
    defaultValues: tokenParameters || {},
  })
  const setBasketProposed = useSetAtom(isNewBasketProposedAtom)
  const setDescription = useSetAtom(proposalDescriptionAtom)
  const resetProposedRoles = useResetAtom(proposedRolesAtom)
  const resetSpellUpgrade = useResetAtom(spellUpgradeAtom)

  useEffect(() => {
    return () => {
      setBasketProposed(false)
      resetProposedRoles()
      resetSpellUpgrade()
      setEditing(true)
      setDescription('')
    }
  }, [])

  useEffect(() => {
    const tokenParametersHash = keccak256(
      stringToBytes(JSON.stringify(tokenParameters))
    )
    if (tokenParameters && lastTokenParametersHash !== tokenParametersHash) {
      setLastTokenParametersHash(tokenParametersHash)
      form.reset(tokenParameters)
    }
  }, [tokenParameters])

  return (
    <Box variant="layout.wrapper">
      <FormProvider {...form}>
        <Updater />
        {isEditing && !isAssistedUpgrade ? <Proposal /> : <ConfirmProposal />}
      </FormProvider>
    </Box>
  )
}

export default GovernanceProposal
