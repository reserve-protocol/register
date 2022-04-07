import { Input } from 'components'
import { InputProps as ThemeInputProps } from 'theme-ui'

const inputRegex = RegExp(`^[0-9]*[.]?[0-9]*$`)

interface InputProps extends Omit<ThemeInputProps, 'onChange'> {
  onChange(value: string): void
}

const NumericalInput = ({ onChange, ...props }: InputProps) => {
  const handleChange = (value: string) => {
    const input = value.replace(/,/g, '.')
    if (value === '' || inputRegex.test(input)) {
      onChange(input)
    }
  }

  return (
    <Input
      {...props}
      onChange={handleChange}
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
}

export default NumericalInput
