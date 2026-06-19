import { FormMessage } from '@/components/ui/form'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Trans, useLingui } from '@lingui/react/macro'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { ImageUploader } from './logo-upload'
import MultiSelectTags from './manage-tags'
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '@/components/ui/select'

const DownloadableResources = () => {
  const { t } = useLingui()
  const form = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'dtf.files',
  })

  return (
    <div className="flex flex-col gap-2 border rounded-3xl p-3 mt-1">
      <div>
        <h4 className="font-bold">
          <Trans>Downloadable resources</Trans>
        </h4>
        <p className="text-legend">
          <Trans>
            Links to files holders can download from the DTF overview page, like
            a tear sheet or methodology document.
          </Trans>
        </p>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <FormField
            control={form.control}
            name={`dtf.files.${index}.name`}
            render={({ field: nameField }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder={t`File name`} {...nameField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`dtf.files.${index}.url`}
            render={({ field: urlField }) => (
              <FormItem className="flex-[2]">
                <FormControl>
                  <Input placeholder="https://..." {...urlField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
            <span className="sr-only">
              <Trans>Remove resource</Trans>
            </span>
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="rounded-xl gap-1"
        onClick={() => append({ url: '', name: '' })}
      >
        <Plus size={16} />
        <Trans>Add file</Trans>
      </Button>
    </div>
  )
}

const ManageAbout = () => {
  const { t } = useLingui()
  const form = useFormContext()

  return (
    <div className="flex flex-col gap-2 p-2">
      <label className="ml-3">
        <Trans>DTF Icon</Trans>
      </label>
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
            <FormLabel>
              <Trans>About this DTF</Trans>
            </FormLabel>
            <FormControl>
              <Textarea placeholder={t`About this DTF`} {...field} />
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
            <FormLabel>
              <Trans>Notes from Creator</Trans>
            </FormLabel>
            <FormControl>
              <Textarea placeholder={t`Notes from Creator`} {...field} />
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
            <FormLabel>
              <Trans>DTF Fact sheet</Trans>
            </FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="dtf.video"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans>Brand video</Trans>
            </FormLabel>
            <FormControl>
              <Input placeholder="https://youtube.com/..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <DownloadableResources />
    </div>
  )
}
export default ManageAbout
