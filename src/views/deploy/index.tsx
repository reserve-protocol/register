import { useWeb3React } from '@web3-react/core'
import {
  backupCollateralAtom,
  basketAtom,
  revenueSplitAtom,
} from 'components/rtoken-setup/atoms'
import Layout from 'components/rtoken-setup/Layout'
import { useResetAtom } from 'jotai/utils'
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
  const resetBasket = useResetAtom(basketAtom)
  const resetBackup = useResetAtom(backupCollateralAtom)
  const resetRevenueSplit = useResetAtom(revenueSplitAtom)

  useEffect(() => {
    return () => {
      resetBackup()
      resetBasket()
      resetRevenueSplit()
    }
  }, [])

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
