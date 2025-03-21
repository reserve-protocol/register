import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFormContext } from 'react-hook-form'

export type BasicInputProps = {
  fieldName: string
  label: string
  placeholder: string
  type?: React.HTMLInputTypeAttribute
  labelPosition?: 'start' | 'end'
  disabled?: boolean
  defaultValue?: string | number
  highlightLabel?: boolean
  decimalPlaces?: number
  autoFocus?: boolean
  inputProps?: React.ComponentProps<typeof Input>,
}

const BasicInput = ({
  fieldName,
  label,
  placeholder,
  type = 'text',
  labelPosition = 'end',
  defaultValue = '',
  disabled = false,
  highlightLabel = false,
  autoFocus = false,
  decimalPlaces,
  inputProps,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & BasicInputProps) => {
  const form = useFormContext()

  const adornment = (
    <FormLabel
      className={cn(
        'pr-1 font-normal text-base text-nowrap',
        highlightLabel && 'text-primary'
      )}
    >
      {label}
    </FormLabel>
  )

  return (
    <div {...props}>
      <FormField
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                onInput={(e) => {
                  if (type === 'number' || decimalPlaces) {
                    const value = e.currentTarget.value
                    if (value.includes('-')) {
                      e.currentTarget.value = value.replace('-', '')
                    }
                  }
                  if (decimalPlaces) {
                    const value = e.currentTarget.value
                    const hasDecimal = value.includes('.')
                    if (hasDecimal) {
                      const [integer, decimal] = value.split('.')
                      if (decimal.length > decimalPlaces) {
                        e.currentTarget.value = `${integer}.${decimal.slice(0, decimalPlaces)}`
                      }
                    }
                  }
                }}
                type={type}
                placeholder={placeholder}
                startAdornment={
                  labelPosition === 'start' ? adornment : undefined
                }
                autoFocus={autoFocus}
                autoComplete="new-password"
                endAdornment={labelPosition === 'end' ? adornment : undefined}
                className="px-1 text-base [&:focus::placeholder]:opacity-0 [&:focus::placeholder]:transition-opacity"
                {...field}
                {...inputProps}
                value={field.value ?? defaultValue}
                disabled={disabled}
                onFocus={(e) => e.target.select()}
                onWheel={(e) => e.currentTarget.blur()}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default BasicInput
