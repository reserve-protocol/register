import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormContext } from 'react-hook-form'

const ManageSocials = () => {
  const form = useFormContext()

  return (
    <div className="flex flex-col gap-2 p-2">
      <FormField
        control={form.control}
        name="socials.twitter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Twitter / X Link</FormLabel>
            <FormControl>
              <Input placeholder="https://x.com/username" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="socials.telegram"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telegram Link</FormLabel>
            <FormControl>
              <Input placeholder="https://t.me/username" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="socials.discord"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Discord Link</FormLabel>
            <FormControl>
              <Input placeholder="https://discord.com/username" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="socials.website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website Link</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}

export default ManageSocials
