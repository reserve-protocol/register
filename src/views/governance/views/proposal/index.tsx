import Layout from 'components/rtoken-setup/Layout'
import useToggledSidebar from 'hooks/useToggledSidebar'
import { FormProvider, useForm } from 'react-hook-form'
import { defaultValues } from 'views/deploy/utils'
import ProposalForm from './components/ProposalForm'
import ProposalNavigation from './components/ProposalNavigation'
import ProposalPreview from './components/ProposalOverview'
import RTokenDataUpdater from './components/Updater'

const GovernanceProposal = () => {
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })
  useToggledSidebar()

  return (
    <FormProvider {...form}>
      <RTokenDataUpdater />
      <Layout>
        <ProposalNavigation />
        <ProposalForm />
        <ProposalPreview />
      </Layout>
    </FormProvider>
  )
}

export default GovernanceProposal
