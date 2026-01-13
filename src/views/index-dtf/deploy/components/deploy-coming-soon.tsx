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
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-132px)] lg:mt-6">
      <div className="flex gap-1 p-1 w-full bg-secondary lg:rounded-4xl lg:h-[calc(100vh-132px)] lg:max-h-[900px] overflow-visible lg:overflow-hidden">
        <div className="flex flex-col flex-grow relative min-w-full lg:min-w-[420px] bg-card lg:rounded-3xl p-3 lg:p-6 lg:pb-4 lg:h-full overflow-y-visible lg:overflow-y-auto">
          <div className="border rounded-full border-primary p-2 w-fit text-primary">
            <Globe size={14} />
          </div>
          <div className="flex-grow min-h-3 lg:min-h-6" />
          <h2 className="text-3xl text-primary font-semibold mb-0.5">
            Want to create an Index DTF?
          </h2>
          <p className="max-w-[520px] text-legend">
            Fill out the information below and ABC Labs will reach out!
          </p>
          <div className="-mx-3 lg:-mx-6 w-[calc(100%+1.5rem)] lg:w-[calc(100%+3rem)] border-t border-secondary my-4" />
          {submitted ? (
            <div className="p-4 bg-primary/10 rounded-xl text-center">
              <p className="text-primary font-medium">
                Thank you! We'll be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  How can we reach you? *
                </label>
                <div className="lg:-mx-3">
                  <SocialMediaInput
                    value={contactValue}
                    onChange={(val) => setValue('contactValue', val)}
                    selected={selectedContact}
                    onSelectChange={setSelectedContact}
                    disabled={submitting}
                    error={!!errors.contactValue}
                  />
                </div>
                {errors.contactValue && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.contactValue.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Can you describe the DTF you want to create? *
                </label>
                <Textarea
                  {...register('dtfDescription')}
                  placeholder="e.g. tokens to be included, strategy, methodology"
                  className={`w-full lg:-mx-3 lg:w-[calc(100%+1.5rem)] rounded-xl ${errors.dtfDescription ? 'border-destructive' : ''}`}
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
                <label className="block text-sm font-medium mb-2">
                  How do you plan to get people to invest in your DTF?
                </label>
                <Textarea
                  {...register('investmentPlan')}
                  className="w-full lg:-mx-3 lg:w-[calc(100%+1.5rem)] rounded-xl"
                  disabled={submitting}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Why do you think people want this DTF?
                </label>
                <Textarea
                  {...register('whyPeopleWant')}
                  className="w-full lg:-mx-3 lg:w-[calc(100%+1.5rem)] rounded-xl"
                  disabled={submitting}
                  rows={2}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full lg:-mx-3  lg:w-[calc(100%+1.5rem)] rounded-xl h-12"
              >
                {submitting ? 'Submitting...' : 'Contact me'}
              </Button>
            </form>
          )}
        </div>
        <div className="rounded-3xl flex-grow h-full hidden max-w-[50%] lg:block overflow-hidden">
          <img
            src={isDarkMode ? '/imgs/GM-dark.svg' : '/imgs/GM-light.svg'}
            className="w-full h-full object-cover object-center rounded-3xl"
            alt="reserve splash"
          />
        </div>
      </div>
      <a
        href={ROUTES.DEPLOY_YIELD}
        target="_blank"
        className="text-legend underline my-9 text-center"
      >
        Looking to create a Yield DTF?
      </a>
    </div>
  )
}

export default DeployComingSoon
