import useToggledSidebar from 'hooks/useToggledSidebar'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { rTokenParamsAtom } from 'state/atoms'
import {
  isNewBasketProposedAtom,
  isProposalEditingAtom,
  proposedRolesAtom,
} from './atoms'
import ConfirmProposal from './components/ConfirmProposal'
import Proposal from './components/Proposal'
import RTokenDataUpdater from './components/Updater'
import ChangesUpdater from './updater'

const GovernanceProposal = () => {
  const tokenParameters = useAtomValue(rTokenParamsAtom)
  const isEditing = useAtomValue(isProposalEditingAtom)

  const form = useForm({
    mode: 'onChange',
    defaultValues: tokenParameters,
  })
  const setBasketProposed = useSetAtom(isNewBasketProposedAtom)
  const resetProposedRoles = useResetAtom(proposedRolesAtom)
  useToggledSidebar()

  useEffect(() => {
    return () => {
      setBasketProposed(false)
      resetProposedRoles()
    }
  }, [])

  return (
    <FormProvider {...form}>
      <RTokenDataUpdater />
      <ChangesUpdater />
      {isEditing ? <Proposal /> : <ConfirmProposal />}
    </FormProvider>
  )
}

export default GovernanceProposal
