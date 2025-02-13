import { FormDescription, FormMessage } from '@/components/ui/form'

import { Input } from '@/components/ui/input'

import {
  FormControl,
  FormItem,
  FormLabel,
  FormField,
} from '@/components/ui/form'

import { useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploader } from './logo-upload'
import { Switch } from '@/components/ui/switch'
import MultiSelectTags from './manage-tags'

const ManageAbout = () => {
  const form = useForm()

  return (
    <div className="flex flex-col gap-2 p-2">
      <label className="ml-3">DTF Icon</label>
      <ImageUploader onChange={(file) => form.setValue('files.logo', file)} />
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
          checked={form.watch('dtf.hidden')}
          onCheckedChange={(checked) => form.setValue('dtf.hidden', checked)}
        />
      </div>
    </div>
  )
}
export default ManageAbout
