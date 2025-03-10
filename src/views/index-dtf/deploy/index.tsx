import withNavigationGuard from '@/hoc/with-navigation-guard'
import { ROUTES } from '@/utils/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowUpRight, Flower, Globe } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import DeployAccordion from './components/deploy-accordion'
import RightPanel from './components/right-panel'
import {
  DeployFormSchema,
  DeployInputs,
  dtfDeployDefaultValues,
} from './form-fields'
import Updater from './updater'
import useTrackPage from '@/hooks/useTrackPage'

const DeployerHeader = () => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between gap-2 px-6 py-5 text-primary dark:text-muted-foreground">
      <div className="flex items-center gap-2 ">
        <div className="rounded-full p-[6px] border border-primary dark:border-muted-foreground">
          <Globe size={20} strokeWidth={1.5} />
        </div>
        <div className="text-xl font-medium">Create New Index DTF</div>
      </div>
      <div
        className="hidden sm:flex items-center gap-2 cursor-pointer"
        onClick={() => navigate(ROUTES.DEPLOY_YIELD)}
        role="button"
      >
        <Flower size={16} strokeWidth={2} />
        <div>Looking for Yield DTFs?</div>
        <div className="rounded-full p-1 bg-primary text-white dark:bg-muted-foreground/20">
          <ArrowUpRight size={12} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

const IndexTokenDeploy = () => {
  useTrackPage('create', 'index_dtf')

  const form = useForm<DeployInputs>({
    resolver: zodResolver(DeployFormSchema),
    defaultValues: dtfDeployDefaultValues,
  })

  return (
    <div className="min-h-full">
      <div className="container grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2 py-2 sm:py-6 px-0 sm:px-2">
        <FormProvider {...form}>
          <div className="flex flex-col rounded-3xl border-4 border-secondary bg-secondary h-max">
            <DeployerHeader />
            <DeployAccordion />
          </div>
          <div className="h-max rounded-3xl border-4 border-secondary col-span-1">
            <RightPanel />
          </div>
        </FormProvider>
      </div>
      <Updater />
    </div>
  )
}

export default withNavigationGuard(IndexTokenDeploy)
