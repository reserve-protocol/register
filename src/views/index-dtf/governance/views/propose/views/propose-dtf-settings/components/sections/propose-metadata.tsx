import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { indexDTFVersionAtom } from '@/state/dtf/atoms'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'

const ProposeMetadata = () => {
  const { t } = useLingui()
  const form = useFormContext()
  const version = useAtomValue(indexDTFVersionAtom)
  const isV5 = version.startsWith('5')

  return (
    <div className="px-4 mb-4 flex flex-col gap-4">
      {isV5 && (
        <FormField
          control={form.control}
          name="tokenName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                <Trans>Token Name</Trans>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t`Enter token name`}
                  maxLength={80}
                  className="text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={form.control}
        name="mandate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              <Trans>Mandate</Trans>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder={t`This Index DTF will…`}
                rows={6}
                className="px-1 text-base [&:focus::placeholder]:opacity-0 [&:focus::placeholder]:transition-opacity"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default ProposeMetadata
