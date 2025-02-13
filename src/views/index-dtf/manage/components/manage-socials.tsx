import { FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'

const ManageSocials = () => {
  const form = useForm()

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
            <FormMessage />
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
            <FormMessage />
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
            <FormMessage />
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
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default ManageSocials
