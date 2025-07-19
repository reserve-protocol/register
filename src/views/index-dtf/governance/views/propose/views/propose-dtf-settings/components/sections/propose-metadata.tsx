import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useFormContext } from 'react-hook-form'

const ProposeMetadata = () => {
  const form = useFormContext()

  return (
    <div className="px-4 mb-4">
      <FormField
        control={form.control}
        name="mandate"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                placeholder="This Index DTF will…"
                rows={6}
                className="px-1 text-base [&:focus::placeholder]:opacity-0 [&:focus::placeholder]:transition-opacity"
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

export default ProposeMetadata
