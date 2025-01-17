import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import DeployAccordion from './components/deploy-accordion'
import {
  DeployFormSchema,
  DeployInputs,
  dtfDeployDefaultValues,
} from './form-fields'
import RightPanel from './components/right-panel'
import Updater from './updater'

const IndexTokenDeploy = () => {
  const form = useForm<DeployInputs>({
    resolver: zodResolver(DeployFormSchema),
    defaultValues: dtfDeployDefaultValues,
  })

  return (
    <div className="min-h-full">
      <div className="container grid grid-cols-2 lg:grid-cols-3 gap-2 py-6 px-4">
        <FormProvider {...form}>
          <div className="flex rounded-3xl border-4 border-secondary col-span-2 h-max">
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
