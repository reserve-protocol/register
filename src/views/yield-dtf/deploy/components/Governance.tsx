import Layout from 'components/rtoken-setup/Layout'
import { governanceDefaultValues } from 'components/rtoken-setup/atoms'
import { FormProvider, useForm } from 'react-hook-form'
import GovernanceOverview from './GovernanceOverview'
import NavigationSidebar from './NavigationSidebar'
import RTokenSetup from './RTokenSetup'

const Governance = () => {
  const form = useForm({
    mode: 'onChange',
    defaultValues: governanceDefaultValues,
  })

  return (
    <div className="max-w-[1400px] mx-auto px-4">
      <Layout>
        <FormProvider {...form}>
          <NavigationSidebar governance />
          <RTokenSetup governance />
          <GovernanceOverview className="lg:sticky lg:top-0 lg:self-start" />
        </FormProvider>
      </Layout>
    </div>
  )
}

export default Governance
