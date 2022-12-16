import { useWeb3React } from '@web3-react/core'
import {
  backupCollateralAtom,
  basketAtom,
  revenueSplitAtom,
} from 'components/rtoken-setup/atoms'
import Layout from 'components/rtoken-setup/Layout'
import useRToken from 'hooks/useRToken'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import DeployOverview from './components/DeployOverview'
import GovernanceOverview from './components/GovernanceOverview'
import NavigationSidebar from './components/NavigationSidebar'
import RTokenSetup from './components/RTokenSetup'
import { deployIdAtom, useDeployTxState } from './useDeploy'
import { governanceIdAtom } from './useGovernance'
import { defaultValues } from './utils'

const Deploy = () => {
  const [governance, setGovernance] = useState(false)
  const { account } = useWeb3React()
  const rToken = useRToken()
  const deployTx = useDeployTxState()

  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })
  const resetBasket = useResetAtom(basketAtom)
  const resetBackup = useResetAtom(backupCollateralAtom)
  const resetRevenueSplit = useResetAtom(revenueSplitAtom)
  const resetGovId = useResetAtom(governanceIdAtom)
  const resetDeployId = useResetAtom(deployIdAtom)

  useEffect(() => {
    return () => {
      resetBackup()
      resetBasket()
      resetRevenueSplit()
      resetGovId()
      resetDeployId()
    }
  }, [])

  useEffect(() => {
    if (account) {
      form.setValue('ownerAddress', account)
    }
  }, [account])

  // Listen for RToken change, if we have a tx and the rtoken
  // then switch to governance setup
  useEffect(() => {
    if (
      deployTx?.extra?.rTokenAddress &&
      rToken?.address === deployTx.extra.rTokenAddress
    ) {
      setGovernance(true)
    }
  }, [rToken?.address])

  const OverviewComponent = governance ? GovernanceOverview : DeployOverview

  return (
    <FormProvider {...form}>
      <Layout>
        <NavigationSidebar />
        <RTokenSetup governance={governance} />
        <OverviewComponent sx={{ position: 'sticky', top: 0 }} />
      </Layout>
    </FormProvider>
  )
}

export default Deploy
