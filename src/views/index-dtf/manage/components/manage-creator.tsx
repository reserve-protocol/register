import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Trans, useLingui } from '@lingui/react/macro'
import { useFormContext } from 'react-hook-form'
import { ImageUploader } from './logo-upload'

const ManageCreator = () => {
  const { t } = useLingui()
  const form = useFormContext()

  return (
    <div className="flex flex-col gap-2 p-2">
      <label className="ml-3">
        <Trans>Creator Image</Trans>
      </label>
      <ImageUploader
        onChange={(file) => form.setValue('files.creatorLogo', file)}
        defaultImage={form.watch('creator.icon')}
      />
      <FormField
        control={form.control}
        name="creator.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans>Creator Name</Trans>
            </FormLabel>
            <FormControl>
              <Input placeholder={t`Creator Name`} {...field} />
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
            <FormLabel>
              <Trans>Creator Link</Trans>
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
export default ManageCreator
