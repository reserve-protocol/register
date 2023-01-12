import Layout from 'components/rtoken-setup/Layout'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { governanceIdAtom } from '../useGovernance'
import { governanceDefaultValues as defaultValues } from '../utils'
import GovernanceOverview from './GovernanceOverview'
import NavigationSidebar from './NavigationSidebar'
import RTokenSetup from './RTokenSetup'

const Governance = () => {
  const resetGovId = useResetAtom(governanceIdAtom)
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })

  useEffect(() => {
    return () => {
      resetGovId()
    }
  }, [])

  return (
    <FormProvider {...form}>
      <Layout>
        <NavigationSidebar governance />
        <RTokenSetup governance />
        <GovernanceOverview sx={{ position: 'sticky', top: 0 }} />
      </Layout>
    </FormProvider>
  )
}

export default Governance
