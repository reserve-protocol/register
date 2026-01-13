import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { walletAtom } from '@/state/atoms'
import { ROUTES } from '@/utils/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtomValue } from 'jotai'
import { Combine, Globe, Palette, Zap } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useColorMode } from 'theme-ui'
import { z } from 'zod'
import SocialMediaInput, {
  SOCIAL_MEDIA_OPTIONS,
  type SocialMediaOption,
} from './social-media-input'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || ''

const formSchema = z.object({
  contactValue: z.string().min(1, 'Required'),
  dtfDescription: z.string().min(1, 'Required'),
  investmentPlan: z.string().optional(),
  whyPeopleWant: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const DeployComingSoon = () => {
  const [colorMode] = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const account = useAtomValue(walletAtom)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedContact, setSelectedContact] = useState<SocialMediaOption>(
    SOCIAL_MEDIA_OPTIONS[0]
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactValue: '',
      dtfDescription: '',
      investmentPlan: '',
      whyPeopleWant: '',
    },
  })

  const contactValue = watch('contactValue')

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      await fetch(STORAGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: account || 'Wallet not connected',
          amount: 'Create index DTF',
          contactType: selectedContact.key,
          [selectedContact.key]: data.contactValue,
          dtfDescription: data.dtfDescription,
          investmentPlan: data.investmentPlan,
          whyPeopleWant: data.whyPeopleWant,
        }),
      })
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting data:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container flex gap-1 p-1 mt-1 lg:mt-6 bg-secondary rounded-4xl">
      <div className="flex flex-col flex-grow relative min-w-full lg:min-w-[420px] bg-card rounded-3xl p-3 lg:p-6 sm:max-h-[calc(100vh-132px)] overflow-y-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="border rounded-full border-foreground p-2 mr-auto">
            <Globe size={14} />
          </div>
        </div>
        <h2 className="text-3xl text-primary font-semibold mb-0.5">
          Want to create an Index DTF?
        </h2>
        <p className="mb-4 max-w-[520px] text-legend">
          Fill out the information below and ABC Labs will reach out!
        </p>

        {submitted ? (
          <div className="p-4 bg-primary/10 rounded-xl text-center">
            <p className="text-primary font-medium">
              Thank you! We'll be in touch soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                How can we reach you? *
              </label>
              <SocialMediaInput
                value={contactValue}
                onChange={(val) => setValue('contactValue', val)}
                selected={selectedContact}
                onSelectChange={setSelectedContact}
                disabled={submitting}
                error={!!errors.contactValue}
              />
              {errors.contactValue && (
                <p className="text-destructive text-sm mt-1">
                  {errors.contactValue.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Can you describe the DTF you want to create? *
              </label>
              <Textarea
                {...register('dtfDescription')}
                placeholder="e.g. tokens to be included, strategy, methodology"
                className={errors.dtfDescription ? 'border-destructive' : ''}
                disabled={submitting}
                rows={3}
              />
              {errors.dtfDescription && (
                <p className="text-destructive text-sm mt-1">
                  {errors.dtfDescription.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                How do you plan to get people to invest in your DTF?
              </label>
              <Textarea
                {...register('investmentPlan')}
                disabled={submitting}
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Why do you think people want this DTF?
              </label>
              <Textarea
                {...register('whyPeopleWant')}
                disabled={submitting}
                rows={2}
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Submitting...' : 'Contact me'}
            </Button>
          </form>
        )}
        <div className="mx-auto mt-2">
          <a
            href={ROUTES.DEPLOY_YIELD}
            target="_blank"
            className="text-legend underline"
          >
            Looking to create a Yield DTF?
          </a>
        </div>
      </div>
      <div className="rounded-3xl flex-grow max-h-[calc(100vh-132px)] h-[710px] hidden max-w-[50%] lg:block">
        <img
          src={isDarkMode ? '/imgs/GM-dark.svg' : '/imgs/GM-light.svg'}
          className="w-full h-full object-cover object-center rounded-3xl"
          alt="reserve splash"
        />
      </div>
    </div>
  )
}

export default DeployComingSoon
