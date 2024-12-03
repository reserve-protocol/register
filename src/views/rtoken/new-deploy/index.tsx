import { rTokenDefaultValues } from 'components/rtoken-setup/atoms'
import { FormProvider, useForm } from 'react-hook-form'
import DeployAccordion from './components/deploy-accordion'

const Deploy = () => {
  const form = useForm({
    mode: 'onChange',
    defaultValues: rTokenDefaultValues,
  })

  return (
    <div className="min-h-full">
      <div className="container grid grid-cols-3 gap-2 py-12">
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

export default Deploy
