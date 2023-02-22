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
import Governance from './components/Governance'
import NavigationSidebar from './components/NavigationSidebar'
import RTokenSetup from './components/RTokenSetup'
import { deployIdAtom, useDeployTxState } from './useDeploy'
import { governanceIdAtom } from './useGovernance'
import { defaultValues } from './utils'

const Deploy = () => {
  const [governance, setGovernance] = useState(false)
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

  // Listen for RToken change, if we have a tx and the rtoken
  // then switch to governance setup
  useEffect(() => {
    if (
      deployTx?.extra?.rTokenAddress &&
      rToken?.address === deployTx.extra.rTokenAddress
    ) {
      form.reset()
      setGovernance(true)
    }
  }, [rToken?.address])

  if (governance) {
    return <Governance />
  }

  return (
    <FormProvider {...form}>
      <Layout>
        <NavigationSidebar />
        <RTokenSetup governance={governance} />
        <DeployOverview sx={{ position: 'sticky', top: 0 }} />
      </Layout>
    </FormProvider>
  )
}

export default Deploy
