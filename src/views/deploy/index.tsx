import { useWeb3React } from '@web3-react/core'
import Layout from 'components/rtoken-setup/Layout'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import DeployOverview from './components/DeployOverview'
import NavigationSidebar from './components/NavigationSidebar'
import RTokenSetup from './components/RTokenSetup'
import { defaultValues } from './utils'

const Deploy = () => {
  const { account } = useWeb3React()
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })

  useEffect(() => {
    if (account) {
      form.setValue('ownerAddress', account)
    }
  }, [account])

  return (
    <FormProvider {...form}>
      <Layout>
        <NavigationSidebar />
        <RTokenSetup />
        <DeployOverview sx={{ position: 'sticky', top: 0 }} />
      </Layout>
    </FormProvider>
  )
}

export default Deploy
