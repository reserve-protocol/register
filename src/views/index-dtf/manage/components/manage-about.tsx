import { FormMessage } from '@/components/ui/form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useFormContext } from 'react-hook-form'
import { ImageUploader } from './logo-upload'
import MultiSelectTags from './manage-tags'
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '@/components/ui/select'

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
      <FormField
        control={form.control}
        name="dtf.prospectus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>DTF Fact sheet</FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="dtf.basketType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Basket Type</FormLabel>
            <FormControl>
              <Select {...field} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Basket Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage-based">
                    Percentage Based
                  </SelectItem>
                  <SelectItem value="unit-based">Unit Based</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />

      <div className="flex items-center gap-6 border rounded-3xl p-3 mt-1">
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
