import { Button } from '@/components/ui/button'

import { useAtomValue } from 'jotai'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { deployStepAtom } from '../atoms'
import { DeployInputs, dtfDeploySteps } from '../form-fields'

type FieldName = keyof DeployInputs

const NextButton = () => {
  const deployStep = useAtomValue(deployStepAtom)
  const { reset, trigger, handleSubmit } = useFormContext<DeployInputs>()

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
