import { Button } from '@/components/ui/button'

import { useAtom } from 'jotai'
import {
  FieldErrors,
  FieldValues,
  SubmitHandler,
  useFormContext,
} from 'react-hook-form'
import { deployStepAtom } from '../atoms'
import { DeployInputs, DeployStepId, dtfDeploySteps } from '../form-fields'
import { DEPLOY_STEPS } from './deploy-accordion'

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
  const [deployStep, setDeployStep] = useAtom(deployStepAtom)
  const { reset, trigger, handleSubmit, formState, getValues } =
    useFormContext<DeployInputs>()

  const formErrors = formState.errors as ExtendedFieldErrors<
    typeof formState.errors
  >

  const stepError = deployStep ? formErrors[deployStep]?.message : ''

  const processForm: SubmitHandler<DeployInputs> = (data) => {
    console.log(data)
    reset()
  }

  const validateCurrentStepAndGoNext = async () => {
    if (!deployStep) return

    const fields = dtfDeploySteps[deployStep].fields
    const output = await trigger([...fields, deployStep] as FieldName[], {
      shouldFocus: true,
    })

    if (!output) return

    const currentStepIdx = DEPLOY_STEPS.findIndex(
      (step) => step.id === deployStep
    )
    const nextStep = DEPLOY_STEPS[currentStepIdx + 1]?.id

    setDeployStep(nextStep)
  }

  const validateFormAndSubmit = async () => {
    // const output = await trigger()
    // if (!output) return
    // await handleSubmit(processForm)()
  }

  const next = async () => {
    validateCurrentStepAndGoNext()
    validateFormAndSubmit()
  }

  return (
    <div className="px-2 pb-2">
      {stepError && <div className="mx-4 mb-2 text-red-500">{stepError}</div>}
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
