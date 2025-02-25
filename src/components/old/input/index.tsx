import { useCallback } from 'react'
import { Search } from 'lucide-react'
import {
  Box,
  Input as ThemeInput,
  InputProps as ThemeInputProps,
} from 'theme-ui'

interface InputProps extends Omit<ThemeInputProps, 'onChange'> {
  onChange(value: string): void
}

const Input = ({ onChange, ...props }: InputProps) => {
  const handleChange = useCallback(
    (event: any) => {
      onChange(event.target.value)
    },
    [onChange]
  )

  return <ThemeInput {...props} onChange={handleChange} />
}

export const SearchInput = (props: InputProps) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <Search
        size={16}
        style={{ position: 'absolute', top: 'calc(50% - 8px)', left: 16 }}
      />
      <Input pl={6} {...props} />
    </Box>
  )
}

export default Input
