import useTrackPage from '@/hooks/useTrackPage'
import { getPlatformFee } from '@/utils/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { Globe } from 'lucide-react'
import { useEffect } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useSetAtom } from 'jotai'
import {
  readonlyStepsAtom,
  selectedGovernanceOptionAtom,
} from '../atoms'
import DeployAccordion from '../components/deploy-accordion'
import RightPanel from '../components/right-panel'
import { DeployFormSchema, DeployStepId } from '../form-fields'
import {
  getPermissionlessDefaults,
  PERMISSIONLESS_READONLY_STEPS,
  PERMISSIONLESS_VOTE_LOCK,
} from '../permissionless-defaults'
import Updater from '../updater'
import { ChainId } from '@/utils/chains'
import withNavigationGuard from '@/hoc/with-navigation-guard'

// Syncs chain-dependent readonly fields when user changes chain in step 1
const PermissionlessUpdater = () => {
  const { watch, setValue } = useFormContext()
  const setGovernanceOption = useSetAtom(selectedGovernanceOptionAtom)
  const setReadonlySteps = useSetAtom(readonlyStepsAtom)
  const chain = watch('chain')

  // Set readonly steps and governance option on mount, reset on unmount
  useEffect(() => {
    setReadonlySteps(PERMISSIONLESS_READONLY_STEPS)
    setGovernanceOption('governanceVoteLock')

    return () => {
      setReadonlySteps(new Set<DeployStepId>())
      setGovernanceOption('governanceERC20address')
    }
  }, [setReadonlySteps, setGovernanceOption])

  // Update governance + revenue when chain changes
  useEffect(() => {
    if (!PERMISSIONLESS_VOTE_LOCK[chain]) return
    const platformFee = getPlatformFee(chain)
    setValue('governanceVoteLock', PERMISSIONLESS_VOTE_LOCK[chain])
    setValue('fixedPlatformFee', platformFee)
    setValue('governanceShare', 100 - platformFee)
    setValue('deployerShare', 0)
    setValue('additionalRevenueRecipients', [])
  }, [chain, setValue])

  return null
}

const PermissionlessHeader = () => (
  <div className="flex items-center gap-2 px-6 py-5 text-primary dark:text-muted-foreground">
    <div className="rounded-full p-[6px] border border-primary dark:border-muted-foreground">
      <Globe size={20} strokeWidth={1.5} />
    </div>
    <div className="text-xl font-medium">Create New Index DTF</div>
  </div>
)

const PermissionlessDeploy = () => {
  useTrackPage('create', 'index_dtf_permissionless')

  const form = useForm({
    resolver: zodResolver(DeployFormSchema),
    defaultValues: getPermissionlessDefaults(ChainId.Base),
  })

  return (
    <div className="min-h-full">
      <div className="container grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2 py-2 sm:py-6 px-0 sm:px-2">
        <FormProvider {...form}>
          <div className="flex flex-col rounded-3xl border-4 border-secondary bg-secondary h-max">
            <PermissionlessHeader />
            <DeployAccordion />
          </div>
          <div className="h-max rounded-3xl border-4 border-secondary col-span-1">
            <RightPanel />
          </div>
          <PermissionlessUpdater />
        </FormProvider>
      </div>
      <Updater />
    </div>
  )
}

export default withNavigationGuard(PermissionlessDeploy)
