import { FormMessage } from '@/components/ui/form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'

import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useFormContext } from 'react-hook-form'
import { ImageUploader } from './logo-upload'
import MultiSelectTags from './manage-tags'

const ManageAbout = () => {
  const form = useFormContext()

  return (
    <div className="flex flex-col gap-2 p-2">
      <label className="ml-3">DTF Icon</label>
      <ImageUploader
        onChange={(file) => form.setValue('files.logo', file)}
        defaultImage={form.watch('dtf.icon')}
      />
      <MultiSelectTags />
      <FormField
        control={form.control}
        name="dtf.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>About this DTF</FormLabel>
            <FormControl>
              <Textarea placeholder="About this DTF" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="dtf.notesFromCreator"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes from Creator</FormLabel>
            <FormControl>
              <Textarea placeholder="Notes from Creator" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex items-center gap-6 border rounded-3xl p-3">
        <div>
          <h4 className="font-bold">Hide DTF</h4>
          <p className="text-legend">
            This will prevent the DTF from appearing in the DTF list. You can
            still access it on the UI using the direct link.
          </p>
        </div>
        <Switch
          checked={form.watch('hidden')}
          onCheckedChange={(checked) => form.setValue('hidden', checked)}
        />
      </div>
    </div>
  )
}
export default ManageAbout
