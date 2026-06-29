import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useGeolocation from '@/hooks/use-geolocation'
import { cn } from '@/lib/utils'
import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { zodResolver } from '@hookform/resolvers/zod'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Lock, SquareArrowOutUpRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || ''
const ELIGIBILITY_DOCS_URL =
  'https://docs.ondo.finance/ondo-global-markets/eligibility'

const messages = {
  required: msg`Required`,
  invalidEmail: msg`Invalid email`,
}

const buildFormSchema = (t: (descriptor: MessageDescriptor) => string) =>
  z.object({
    name: z.string().min(1, t(messages.required)),
    email: z.string().email(t(messages.invalidEmail)),
  })

type FormData = z.infer<ReturnType<typeof buildFormSchema>>

const EligibilityForm = () => {
  const { t } = useLingui()
  const wallet = useAtomValue(walletAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const geolocation = useGeolocation()
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const formSchema = useMemo(() => buildFormSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '' },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setSubmitError(false)
    trackClick('request_eligibility')
    try {
      const response = await fetch(`${STORAGE_URL}eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          country: geolocation.data?.country ?? '',
          countryCode: geolocation.data?.countryCode ?? '',
          ...(wallet ? { address: wallet } : {}),
          dtf: dtf?.id,
          chainId: dtf?.chainId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit eligibility request')
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting eligibility request:', error)
      setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="p-4 bg-primary/10 rounded-xl text-center">
        <p className="text-primary font-medium">
          <Trans>Thank you! We'll be in touch soon.</Trans>
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-2"
    >
      <div>
        <Input
          {...register('name')}
          placeholder={t`Name`}
          disabled={submitting}
          className={
            errors.name ? 'border-destructive' : 'bg-card h-12 rounded-xl pl-4'
          }
        />
        {errors.name && (
          <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Input
          {...register('email')}
          type="email"
          placeholder={t`Email`}
          disabled={submitting}
          className={
            errors.email ? 'border-destructive' : 'bg-card h-12 rounded-xl pl-4'
          }
        />
        {errors.email && (
          <p className="text-destructive text-sm mt-1">
            {errors.email.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl h-12 text-base"
      >
        {submitting ? t`Submitting...` : t`Submit`}
      </Button>
      {submitError && (
        <p className="text-destructive text-sm">
          <Trans>Something went wrong. Please try again.</Trans>
        </p>
      )}
    </form>
  )
}

const EligibilityCard = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-3xl bg-secondary',
        className
      )}
    >
      <div className="flex flex-col gap-1 p-6">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-foreground">
          <Lock size={16} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-bold">
          <Trans>Location restricted</Trans>
        </h3>
        <p>
          <Trans>
            We're sorry, this product isn't available to customers in your
            region. In order to access this DTF, you may need to qualify as a{' '}
            <a
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              href={ELIGIBILITY_DOCS_URL}
            >
              qualified investor
            </a>
            .
          </Trans>
        </p>
      </div>
      <div className="border-t border-secondary" />
      <div className="flex flex-col bg-card p-2 pt-4">
        <div className="flex flex-col gap-1 px-4 mb-4">
          <h4 className="font-bold">
            <Trans>Contact us for eligibility</Trans>
          </h4>
          <p className="text-legend text-sm">
            <Trans>
              To verify eligibility, please leave us your name and email, and we
              will reach out to you personally.
            </Trans>
          </p>
        </div>
        <EligibilityForm />
        <a
          className="flex items-center gap-1 text-primary hover:underline w-fit px-4 pb-3 pt-4"
          target="_blank"
          rel="noopener noreferrer"
          href={ELIGIBILITY_DOCS_URL}
        >
          <Trans>Learn more about eligibility requirements.</Trans>
          <SquareArrowOutUpRight size={16} strokeWidth={1.5} />
        </a>
      </div>
    </div>
  )
}

export default EligibilityCard
