import Layout from 'components/rtoken-setup/Layout'
import {
  backupCollateralAtom,
  basketAtom,
  rTokenDefaultValuesAtom,
  revenueSplitAtom,
} from 'components/rtoken-setup/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { Box } from 'theme-ui'
import { Address } from 'viem'
import DeployOverview from './components/DeployOverview'
import Governance from './components/Governance'
import NavigationSidebar from './components/NavigationSidebar'
import RTokenSetup from './components/RTokenSetup'
import { rTokenMetaAtom } from 'state/rtoken/atoms/rTokenAtom'

// TODO: Totally broken needs to redirect instead of setting token
const Deploy = () => {
  const [governance, setGovernance] = useState(false)
  const defaultValues = useAtomValue(rTokenDefaultValuesAtom)
  const chainId = useAtomValue(chainIdAtom)

  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })
  const setRToken = useSetAtom(rTokenMetaAtom)
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
      setRToken({
        symbol: '',
        address,
        name: '',
        decimals: 18,
        chain: chainId,
      })
      form.reset()
      setGovernance(true)
    },
    [setGovernance, form.reset, chainId, setRToken]
  )

  if (governance) {
    return <Governance />
  }

  return (
    <Box variant="layout.wrapper">
      <Layout>
        <FormProvider {...form}>
          <NavigationSidebar />
          <RTokenSetup governance={governance} />
          <Box variant="layout.sticky">
            <DeployOverview onDeploy={handleDeploy} />
          </Box>
        </FormProvider>
      </Layout>
    </Box>
  )
}

export default Deploy
