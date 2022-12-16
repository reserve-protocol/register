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
    <FormProvider {...form}>
      <Layout>
        <NavigationSidebar />
        <RTokenSetup governance />
        <GovernanceOverview sx={{ position: 'sticky', top: 0 }} />
      </Layout>
    </FormProvider>
  )
}

export default Governance
