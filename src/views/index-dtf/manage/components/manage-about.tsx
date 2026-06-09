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
import { Trans, useLingui } from '@lingui/react/macro'
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
          </FormItem>
        )}
      />

      <div className="flex items-center gap-6 border rounded-3xl p-3 mt-1">
        <div>
          <h4 className="font-bold">
            <Trans>Hide DTF</Trans>
          </h4>
          <p className="text-legend">
            <Trans>
              This will prevent the DTF from appearing in the DTF list. You can
              still access it on the UI using the direct link.
            </Trans>
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
