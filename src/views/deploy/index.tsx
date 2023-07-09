import Layout from 'components/rtoken-setup/Layout'
import {
  backupCollateralAtom,
  basketAtom,
  revenueSplitAtom,
} from 'components/rtoken-setup/atoms'
import { useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { selectedRTokenAtom } from 'state/atoms'
import { Box } from 'theme-ui'
import { Address } from 'viem'
import DeployOverview from './components/DeployOverview'
import Governance from './components/Governance'
import NavigationSidebar from './components/NavigationSidebar'
import RTokenSetup from './components/RTokenSetup'
import { defaultValues } from './utils'

const Deploy = () => {
  const [governance, setGovernance] = useState(false)
  const setRToken = useSetAtom(selectedRTokenAtom)

  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })
  const resetBasket = useResetAtom(basketAtom)
  const resetBackup = useResetAtom(backupCollateralAtom)
  const resetRevenueSplit = useResetAtom(revenueSplitAtom)

  useEffect(() => {
    // setRevenueSplit({ holders: '60', stakers: '40', external: [] })

    return () => {
      resetBackup()
      resetBasket()
      resetRevenueSplit()
    }
  }, [])

  // Move to governance state
  const handleDeploy = useCallback(
    (address: Address) => {
      form.reset()
      setRToken(address)
      setGovernance(true)
    },
    [setGovernance, form.reset, setRToken]
  )

  if (governance) {
    return <Governance />
  }

  return (
    <Layout>
      <FormProvider {...form}>
        <NavigationSidebar />
        <RTokenSetup governance={governance} />
        <Box variant="layout.stickyNoHeader">
          <DeployOverview onDeploy={handleDeploy} />
        </Box>
      </FormProvider>
    </Layout>
  )
}

export default Deploy
