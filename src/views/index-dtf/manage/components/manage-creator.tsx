import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormContext } from 'react-hook-form'
import { ImageUploader } from './logo-upload'

const ManageCreator = () => {
  const form = useFormContext()

  return (
    <div className="flex flex-col gap-2 p-2">
      <label className="ml-3">Creator Image</label>
      <ImageUploader
        onChange={(file) => form.setValue('files.creatorLogo', file)}
      />
      <FormField
        control={form.control}
        name="creator.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Creator Name</FormLabel>
            <FormControl>
              <Input placeholder="Creator Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="creator.link"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Creator Link</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
export default ManageCreator
