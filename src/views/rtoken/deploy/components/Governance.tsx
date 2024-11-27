import Layout from 'components/rtoken-setup/Layout'
import { governanceDefaultValues } from 'components/rtoken-setup/atoms'
import { FormProvider, useForm } from 'react-hook-form'
import { Box } from 'theme-ui'
import GovernanceOverview from './GovernanceOverview'
import NavigationSidebar from './NavigationSidebar'
import RTokenSetup from './RTokenSetup'

const Governance = () => {
  const form = useForm({
    mode: 'onChange',
    defaultValues: governanceDefaultValues,
  })

  return (
    <Box variant="layout.wrapper">
      <Layout>
        <FormProvider {...form}>
          <NavigationSidebar governance />
          <RTokenSetup governance />
          <GovernanceOverview variant="layout.stickyNoHeader" />
        </FormProvider>
      </Layout>
    </Box>
  )
}

export default Governance
