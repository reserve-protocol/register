import Layout from 'components/rtoken-setup/Layout'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { defaultValues } from 'views/deploy/utils'
import ProposalForm from './ProposalForm'
import ProposalNavigation from './ProposalNavigation'
import ProposalPreview from './ProposalPreview'

const GovernanceProposal = () => {
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })

  useEffect(() => {}, [])

  return (
    <FormProvider {...form}>
      <Layout>
        <ProposalNavigation />
        <ProposalForm />
        <ProposalPreview />
      </Layout>
    </FormProvider>
  )
}

export default GovernanceProposal
