import { Button } from '@/components/ui/button'
import { Trans } from '@lingui/react/macro'
import { useAtom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { FieldErrors, FieldValues, useFormContext } from 'react-hook-form'
import { deployStepAtom, validatedSectionsAtom } from '../atoms'
import { DeployInputs, DeployStepId, dtfDeploySteps } from '../form-fields'
import { DEPLOY_STEPS } from './deploy-accordion'
import { scrollToSection } from '../utils'

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
  const { trigger, formState, watch, clearErrors } = useFormContext<DeployInputs>()
  const setValidatedSections = useSetAtom(validatedSectionsAtom)

  const formErrors = formState.errors as ExtendedFieldErrors<
    typeof formState.errors
  >

  useEffect(() => {
    const subscription = watch(() => {
      if (deployStep && formErrors[deployStep]) {
        clearErrors(deployStep as any)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, deployStep, formErrors])

  const currentStepIdx = deployStep
    ? DEPLOY_STEPS.findIndex((step) => step.id === deployStep)
    : -1
  const nextStepId = DEPLOY_STEPS[currentStepIdx + 1]?.id

  const stepError = deployStep ? formErrors[deployStep]?.message : ''

  const validateCurrentStepAndGoNext = async () => {
    if (!deployStep) return

    const fields = dtfDeploySteps[deployStep].fields
    const output = await trigger([...fields, deployStep] as FieldName[], {
      shouldFocus: true,
    })

    setValidatedSections((prev) => ({
      ...prev,
      [deployStep as DeployStepId]: Boolean(output),
    }))

    if (!output) return

    scrollToSection(nextStepId ?? DEPLOY_STEPS[0].id)
    setDeployStep(nextStepId)
  }

  const next = async () => {
    validateCurrentStepAndGoNext()
  }

  return (
    <div className="px-2 pb-2">
      {stepError && <div className="mx-4 mb-2 text-red-500">{stepError}</div>}
      <Button
        data-testid={`deploy-confirm-${deployStep}`}
        className="rounded-xl w-full py-7 text-base"
        onClick={() => next()}
      >
        <Trans>Confirm</Trans>
      </Button>
    </div>
  )
}

export default NextButton
