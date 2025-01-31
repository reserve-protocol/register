import { zodResolver } from '@hookform/resolvers/zod'
import { ShipWheel, Flower, ArrowUpRight } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import DeployAccordion from './components/deploy-accordion'
import RightPanel from './components/right-panel'
import {
  DeployFormSchema,
  DeployInputs,
  dtfDeployDefaultValues,
} from './form-fields'
import Updater from './updater'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'

const DeployerHeader = () => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between gap-2 text-primary px-6 py-5">
      <div className="flex items-center gap-2">
        <div className="rounded-full p-[6px] border border-primary">
          <ShipWheel size={20} strokeWidth={1.5} />
        </div>
        <div className="text-xl font-bold">Create New Index DTF</div>
      </div>
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate(ROUTES.DEPLOY_YIELD)}
        role="button"
      >
        <Flower size={16} strokeWidth={2} />
        <div>Looking for yield DTFs?</div>
        <div className="rounded-full p-0.5 bg-primary text-white">
          <ArrowUpRight size={12} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

const IndexTokenDeploy = () => {
  const form = useForm<DeployInputs>({
    resolver: zodResolver(DeployFormSchema),
    defaultValues: dtfDeployDefaultValues,
  })

  return (
    <div className="min-h-full">
      <div className="container grid grid-cols-2 lg:grid-cols-3 gap-2 py-6 px-4">
        <FormProvider {...form}>
          <div className="flex flex-col rounded-3xl border-4 border-secondary bg-secondary col-span-2 h-max">
            <DeployerHeader />
            <DeployAccordion />
          </div>
          <div className="hidden lg:flex h-max rounded-3xl border-4 border-secondary col-span-1">
            <RightPanel />
          </div>
        </FormProvider>
      </div>
      <Updater />
    </div>
  )
}

export default IndexTokenDeploy
