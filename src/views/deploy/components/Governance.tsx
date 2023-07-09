import Layout from 'components/rtoken-setup/Layout'
import { FormProvider, useForm } from 'react-hook-form'
import { governanceDefaultValues as defaultValues } from '../utils'
import GovernanceOverview from './GovernanceOverview'
import NavigationSidebar from './NavigationSidebar'
import RTokenSetup from './RTokenSetup'

const Governance = () => {
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })

  return (
    <Layout>
      <FormProvider {...form}>
        <NavigationSidebar governance />
        <RTokenSetup governance />
        <GovernanceOverview variant="layout.stickyNoHeader" />
      </FormProvider>
    </Layout>
  )
}

export default Governance
