import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import DeployAccordion from './components/deploy-accordion'
import {
  DeployFormSchema,
  DeployInputs,
  dtfDeployDefaultValues,
} from './form-fields'
import PriceUpdater from './updaters/PriceUpdater'

const IndexTokenDeploy = () => {
  const form = useForm<DeployInputs>({
    resolver: zodResolver(DeployFormSchema),
    defaultValues: dtfDeployDefaultValues,
  })

  return (
    <div className="min-h-full">
      <div className="container grid grid-cols-3 gap-2 py-12">
        <PriceUpdater />
        <FormProvider {...form}>
          <div className="flex rounded-3xl border-4 border-secondary col-span-2">
            <DeployAccordion />
          </div>
          <div className="flex h-max rounded-3xl border-4 border-secondary col-span-1">
            Right
          </div>
        </FormProvider>
      </div>
    </div>
  )
}

export default IndexTokenDeploy
