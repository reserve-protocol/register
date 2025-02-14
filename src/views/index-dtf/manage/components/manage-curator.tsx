import { FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { useFormContext } from 'react-hook-form'
import { ImageUploader } from './logo-upload'

const ManageCurator = () => {
  const form = useFormContext()

  return (
    <div className="flex flex-col gap-2 p-2">
      <label className="ml-3">Curator Image</label>
      <ImageUploader
        onChange={(file) => form.setValue('files.curatorLogo', file)}
        defaultImage={form.watch('curator.icon')}
      />
      <FormField
        control={form.control}
        name="curator.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Curator Name</FormLabel>
            <FormControl>
              <Input placeholder="Curator Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="curator.link"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Curator Link</FormLabel>
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
export default ManageCurator
