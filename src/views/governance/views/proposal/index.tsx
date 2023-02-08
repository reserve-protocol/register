import Layout from 'components/rtoken-setup/Layout'
import useToggledSidebar from 'hooks/useToggledSidebar'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { rTokenParamsAtom } from 'state/atoms'
import { isNewBasketProposedAtom } from './atoms'
import ProposalForm from './components/ProposalForm'
import ProposalNavigation from './components/ProposalNavigation'
import ProposalOverview from './components/ProposalOverview'
import RTokenDataUpdater from './components/Updater'

const GovernanceProposal = () => {
  const tokenParameters = useAtomValue(rTokenParamsAtom)

  const form = useForm({
    mode: 'onChange',
    defaultValues: tokenParameters,
  })
  const setBasketProposed = useSetAtom(isNewBasketProposedAtom)
  useToggledSidebar()

  useEffect(() => {
    return () => {
      setBasketProposed(false)
    }
  }, [])

  return (
    <FormProvider {...form}>
      <RTokenDataUpdater />
      <Layout>
        <ProposalNavigation />
        <ProposalForm />
        <ProposalOverview />
      </Layout>
    </FormProvider>
  )
}

export default GovernanceProposal
