import { rTokenDefaultValues } from 'components/rtoken-setup/atoms'
import { FormProvider, useForm } from 'react-hook-form'

const Deploy = () => {
  const form = useForm({
    mode: 'onChange',
    defaultValues: rTokenDefaultValues,
  })

  return (
    <div className="container h-full grid grid-cols-3 gap-2 py-12">
      <FormProvider {...form}>
        <div className="flex rounded-2xl border-4 border-secondary col-span-2">
          Main
        </div>
        <div className="flex rounded-2xl border-4 border-secondary col-span-1">
          Right
        </div>
      </FormProvider>
    </div>
  )
}

export default Deploy
