import {
  backupCollateralAtom,
  basketAtom,
  revenueSplitAtom,
} from 'components/rtoken-setup/atoms'
import Layout from 'components/rtoken-setup/Layout'
import useRToken from 'hooks/useRToken'
import { useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import DeployOverview from './components/DeployOverview'
import Governance from './components/Governance'
import NavigationSidebar from './components/NavigationSidebar'
import RTokenSetup from './components/RTokenSetup'
import { deployIdAtom } from './useDeploy'
import { governanceIdAtom } from './useGovernance'
import { defaultValues } from './utils'
import { Box } from 'theme-ui'

const Deploy = () => {
  const [governance, setGovernance] = useState(false)
  const rToken = useRToken()
  // const deployTx = useDeployTxState()

  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })
  const resetBasket = useResetAtom(basketAtom)
  const resetBackup = useResetAtom(backupCollateralAtom)
  const resetRevenueSplit = useResetAtom(revenueSplitAtom)
  const setRevenueSplit = useSetAtom(revenueSplitAtom)
  const resetGovId = useResetAtom(governanceIdAtom)
  const resetDeployId = useResetAtom(deployIdAtom)

  useEffect(() => {
    setRevenueSplit({ holders: '60', stakers: '40', external: [] })

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
  // TODO: do this after running tx
  // useEffect(() => {
  //   if (
  //     deployTx?.extra?.rTokenAddress &&
  //     rToken?.address === deployTx.extra.rTokenAddress
  //   ) {
  //     form.reset()
  //     setGovernance(true)
  //   }
  // }, [rToken?.address])

  // if (governance) {
  //   return <Governance />
  // }

  return (
    <FormProvider {...form}>
      <Layout>
        <NavigationSidebar />
        <RTokenSetup governance={governance} />
        <Box variant="layout.stickyNoHeader">
          <DeployOverview />
        </Box>
      </Layout>
    </FormProvider>
  )
}

export default Deploy
