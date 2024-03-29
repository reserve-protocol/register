import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { rTokenConfigurationAtom } from 'state/atoms'
import {
  isAssistedUpgradeAtom,
  isNewBasketProposedAtom,
  isProposalEditingAtom,
  proposalDescriptionAtom,
  proposedRolesAtom,
} from './atoms'
import ConfirmProposal from './components/ConfirmProposal'
import Proposal from './components/Proposal'
import Updater from './updater'
import { Box } from 'theme-ui'

const GovernanceProposal = () => {
  const tokenParameters = useAtomValue(rTokenConfigurationAtom) || {}
  const isAssistedUpgrade = useAtomValue(isAssistedUpgradeAtom)
  const [isEditing, setEditing] = useAtom(isProposalEditingAtom)

  const form = useForm({
    mode: 'onChange',
    defaultValues: tokenParameters,
  })
  const setBasketProposed = useSetAtom(isNewBasketProposedAtom)
  const setDescription = useSetAtom(proposalDescriptionAtom)
  const resetProposedRoles = useResetAtom(proposedRolesAtom)

  useEffect(() => {
    return () => {
      setBasketProposed(false)
      resetProposedRoles()
      setEditing(true)
      setDescription('')
    }
  }, [])

  useEffect(() => {
    if (tokenParameters?.shortFreeze) {
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
