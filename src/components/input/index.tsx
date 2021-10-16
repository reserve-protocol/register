import { useCallback } from 'react'
import { Input as ThemeInput } from '@theme-ui/components'

interface InputProps {
  onChange(value: string): void
}

// TODO: Props and styling
const Input = ({ onChange, ...props }: any) => {
  const handleChange = useCallback(
    (event) => {
      onChange(event.target.value)
    },
    [onChange]
  )

  return <ThemeInput {...props} onChange={handleChange} />
}

export default Input
