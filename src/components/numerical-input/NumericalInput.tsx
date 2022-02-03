import { Input } from 'components'

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)

const NumericalInput = (props: any) => (
  <Input
    {...props}
    inputMode="decimal"
    autoComplete="off"
    autoCorrect="off"
    type="text"
    pattern="^[0-9]*[.,]?[0-9]*$"
    minLength={1}
    maxLength={79}
    spellCheck="false"
  />
)

export default NumericalInput
