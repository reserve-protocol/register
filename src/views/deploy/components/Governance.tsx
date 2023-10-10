import Layout from 'components/rtoken-setup/Layout'
import { FormProvider, useForm } from 'react-hook-form'
import GovernanceOverview from './GovernanceOverview'
import NavigationSidebar from './NavigationSidebar'
import RTokenSetup from './RTokenSetup'
import { useAtomValue } from 'jotai'
import { rTokenDefaultGovernanceValuesAtom } from 'components/rtoken-setup/atoms'

const Governance = () => {
  const defaultValues = useAtomValue(rTokenDefaultGovernanceValuesAtom)

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
