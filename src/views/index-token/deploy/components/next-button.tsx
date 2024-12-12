import { Button } from '@/components/ui/button'

import { useAtomValue } from 'jotai'
import {
  FieldErrors,
  FieldValues,
  SubmitHandler,
  useFormContext,
} from 'react-hook-form'
import { deployStepAtom } from '../atoms'
import { DeployInputs, DeployStepId, dtfDeploySteps } from '../form-fields'

type FieldName = keyof DeployInputs
type ExtendedFieldErrors<TFieldValues extends FieldValues> =
  FieldErrors<TFieldValues> & {
    [key in DeployStepId]?: {
      message?: string
      type?: string
      ref?: any
    }
  }

const NextButton = () => {
  const deployStep = useAtomValue(deployStepAtom)
  const { reset, trigger, handleSubmit, formState } =
    useFormContext<DeployInputs>()

  const formErrors = formState.errors as ExtendedFieldErrors<
    typeof formState.errors
  >

  const stepError = deployStep ? formErrors[deployStep]?.message : ''

  const processForm: SubmitHandler<DeployInputs> = (data) => {
    console.log(data)
    reset()
  }

  const next = async () => {
    if (!deployStep) return

    const fields = dtfDeploySteps[deployStep].fields
    const output = await trigger(fields as FieldName[], {
      shouldFocus: true,
    })

    if (!output) return

    await handleSubmit(processForm)()
  }

  return (
    <div className="px-2 pb-2">
      {stepError && <div className="mb-2 text-red-500">{stepError}</div>}
      <Button
        className="rounded-xl w-full py-7 text-base"
        onClick={() => next()}
      >
        Next
      </Button>
    </div>
  )
}

export default NextButton
