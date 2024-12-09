import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormContext } from 'react-hook-form'

type BasicInput = {
  fieldName: string
  label: string
  placeholder: string
  type?: React.HTMLInputTypeAttribute
}

const BasicInput = ({
  fieldName,
  label,
  placeholder,
  type = 'text',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & BasicInput) => {
  const form = useFormContext()

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
                endAdornment={
                  <FormLabel className="pr-1 font-normal text-base text-nowrap">
                    {label}
                  </FormLabel>
                }
                className="px-1 text-base"
                {...field}
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
