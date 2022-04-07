import { useCallback } from 'react'
import { Input as ThemeInput, InputProps as ThemeInputProps } from 'theme-ui'

interface InputProps extends Omit<ThemeInputProps, 'onChange'> {
  onChange(value: string): void
}

// TODO: Props and styling
const Input = ({ onChange, ...props }: InputProps) => {
  const handleChange = useCallback(
    (event: any) => {
      onChange(event.target.value)
    },
    [onChange]
  )

  return <ThemeInput {...props} onChange={handleChange} />
}

export default Input
