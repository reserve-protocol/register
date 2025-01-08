import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormContext } from 'react-hook-form'

export type BasicInputProps = {
  fieldName: string
  label: string
  placeholder: string
  type?: React.HTMLInputTypeAttribute
  labelPosition?: 'start' | 'end'
  defaultValue?: string | number
}

const BasicInput = ({
  fieldName,
  label,
  placeholder,
  type = 'text',
  labelPosition = 'end',
  defaultValue = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & BasicInputProps) => {
  const form = useFormContext()

  const adornment = (
    <FormLabel className="pr-1 font-normal text-base text-nowrap">
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
                type={type}
                placeholder={placeholder}
                startAdornment={
                  labelPosition === 'start' ? adornment : undefined
                }
                autoComplete="off"
                endAdornment={labelPosition === 'end' ? adornment : undefined}
                className="px-1 text-base"
                {...field}
                value={field.value ?? defaultValue}
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
