import { Button } from '@/components/ui/button'
import { useAtomValue } from 'jotai'
import { formReadyForSubmitAtom } from '../atoms'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { DeployInputs } from '../form-fields'

const SubmitButton = () => {
  const { handleSubmit } = useFormContext<DeployInputs>()
  const formReadyForSubmit = useAtomValue(formReadyForSubmitAtom)

  const processForm: SubmitHandler<DeployInputs> = (data) => {
    console.log(data)
  }

  const submitForm = () => {
    handleSubmit(processForm)()
  }

  return (
    <Button
      className="w-full"
      disabled={!formReadyForSubmit}
      onClick={submitForm}
    >
      Deploy
    </Button>
  )
}

export default SubmitButton
