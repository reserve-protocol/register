import { FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Trans, useLingui } from '@lingui/react/macro'
import { useFormContext } from 'react-hook-form'
import { ImageUploader } from './logo-upload'

const ManageCurator = () => {
  const { t } = useLingui()
  const form = useFormContext()

  return (
    <div className="flex flex-col gap-2 p-2">
      <label className="ml-3">
        <Trans>Curator Image</Trans>
      </label>
      <ImageUploader
        onChange={(file) => form.setValue('files.curatorLogo', file)}
        defaultImage={form.watch('curator.icon')}
      />
      <FormField
        control={form.control}
        name="curator.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans>Curator Name</Trans>
            </FormLabel>
            <FormControl>
              <Input placeholder={t`Curator Name`} {...field} />
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
            <FormLabel>
              <Trans>Curator Link</Trans>
            </FormLabel>
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
