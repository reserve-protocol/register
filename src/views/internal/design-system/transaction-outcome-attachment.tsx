import { useId, useState, type FormEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/button'
import {
  Field,
  FieldDescription,
  FieldLabel,
  TextInput,
} from '@/components/design-system-v1/field'
import { transactionAttachedRegionGeometry } from '@/components/design-system-v1/transaction-task-geometry'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { CALENDLY_URL } from '@/utils/schedule-call'

export type TransactionOutcomeAttachmentType = 'updates' | 'intro-call'

export const TransactionOutcomeAttachment = ({
  type,
}: {
  type: TransactionOutcomeAttachmentType
}) => {
  const emailId = useId()
  const headingId = useId()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const submitUpdates = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubscribed(true)
  }

  return (
    <aside
      data-testid="transaction-outcome-attachment-region"
      data-entrance="with-outcome"
      className={`${transactionAttachedRegionGeometry.surface} relative z-0 w-full max-w-none origin-top rounded-none p-2 [animation:transaction-attached-region-grow-down_360ms_ease-out_both] motion-reduce:animate-none`}
    >
      <div data-testid="zapper-outcome-attachment" data-attachment={type}>
        <div
          data-testid="outcome-attachment-copy"
          className="grid gap-1 px-4 pt-4"
        >
          <h4
            id={headingId}
            className={`${v1Typography.itemTitle} text-primary`}
          >
            {type === 'updates'
              ? 'Stay informed about this DTF'
              : 'A direct line to the team'}
          </h4>
          <p className={`${v1Typography.supporting} ${roles.text.supporting}`}>
            {type === 'updates' ? (
              'Get relevant updates about changes that may affect this DTF.'
            ) : (
              <>
                <strong className="font-medium text-foreground">
                  As a larger holder
                </strong>
                , you can schedule an intro call with the Reserve team to meet
                us, get help when needed, and share feedback as we continue to
                build.
              </>
            )}
          </p>
        </div>

        {type === 'updates' ? (
          <form
            aria-labelledby={headingId}
            className="mt-4"
            onSubmit={submitUpdates}
          >
            <Field>
              <FieldLabel htmlFor={emailId} className="sr-only">
                Email
              </FieldLabel>
              <div
                data-testid="outcome-attachment-email-actions"
                className="flex min-w-0 flex-col gap-2 [@container(min-width:440px)]:flex-row"
              >
                <TextInput
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  disabled={subscribed}
                  className="min-w-0 flex-1"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <Button
                  type="submit"
                  disabled={!email || subscribed}
                  className="w-full [@container(min-width:440px)]:w-auto"
                >
                  Subscribe
                </Button>
              </div>
              {subscribed && (
                <FieldDescription role="status">
                  Thanks for getting involved, we’re excited to have you! We’ll
                  reach out with any important updates on this DTF.
                </FieldDescription>
              )}
            </Field>
          </form>
        ) : (
          <Field className="mt-4">
            <Button asChild className="w-full" trailingIcon={<ArrowUpRight />}>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                Schedule an intro call
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Button>
          </Field>
        )}
      </div>
    </aside>
  )
}
