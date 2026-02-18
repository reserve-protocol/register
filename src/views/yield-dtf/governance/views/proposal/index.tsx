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
  spell3_4_0UpgradeAtom,
  spell4_2_0UpgradeAtom,
} from './atoms'
import ConfirmProposal from './components/ConfirmProposal'
import Proposal from './components/Proposal'
import Updater from './updater'
import { keccak256, stringToBytes } from 'viem'
import { isTimeunitGovernance } from '../../utils'

const paramsAtom = atom((get) => {
  const config = get(rTokenConfigurationAtom)
  const governance = get(rTokenGovernanceAtom)
  const isTimeunit = isTimeunitGovernance(governance.name)

  if (!config || !governance.executionDelay) {
    return null
  }

  return {
    ...config,
    votingDelay: Number(governance.votingDelay || 0) / (isTimeunit ? 3600 : 1),
    votingPeriod: Number(governance.votingPeriod || 0) / (isTimeunit ? 3600 : 1),
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
  const resetSpell3_4_0Upgrade = useResetAtom(spell3_4_0UpgradeAtom)
  const resetSpell4_2_0Upgrade = useResetAtom(spell4_2_0UpgradeAtom)

  useEffect(() => {
    return () => {
      setBasketProposed(false)
      resetProposedRoles()
      resetSpell3_4_0Upgrade()
      resetSpell4_2_0Upgrade()
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
    <div className="container">
      <FormProvider {...form}>
        <Updater />
        {isEditing && !isAssistedUpgrade ? <Proposal /> : <ConfirmProposal />}
      </FormProvider>
    </div>
  )
}

export default GovernanceProposal
