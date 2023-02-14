import Layout from 'components/rtoken-setup/Layout'
import useToggledSidebar from 'hooks/useToggledSidebar'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { rTokenParamsAtom } from 'state/atoms'
import { isNewBasketProposedAtom, proposedRolesAtom } from './atoms'
import ProposalForm from './components/ProposalForm'
import ProposalNavigation from './components/ProposalNavigation'
import ProposalOverview from './components/ProposalOverview'
import RTokenDataUpdater from './components/Updater'
import ChangesUpdater from './updater'

const GovernanceProposal = () => {
  const tokenParameters = useAtomValue(rTokenParamsAtom)

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
      <Layout>
        <ProposalNavigation />
        <ProposalForm />
        <ProposalOverview />
      </Layout>
    </FormProvider>
  )
}

export default GovernanceProposal
