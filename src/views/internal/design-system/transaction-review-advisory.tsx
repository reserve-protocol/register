import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { candidateSemanticRoles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'

import { TransactionSidecar } from './transaction-sidecar'

export const TransactionReviewAdvisory = ({
  onDismiss,
  variant = 'closed-impact',
}: {
  onDismiss: () => void
  variant?: 'capacity' | 'closed-error' | 'closed-impact'
}) => {
  const content = REVIEW_ADVISORY_CONTENT[variant]

  return (
    <TransactionSidecar
      contentTestId="zapper-review-advisory"
      dismissLabel="Dismiss suggestion"
      entrance="immediate"
      kind="advisory"
      onDismiss={onDismiss}
      headerStart={
        <LifecycleStatusPill role="actionable" indicator="warning">
          {content.badge}
        </LifecycleStatusPill>
      }
    >
      <div>
        <div className="grid gap-1">
          <h4
            className={`${v1Typography.itemTitle} ${candidateSemanticRoles.feedback.warning.foreground}`}
          >
            {content.title}
          </h4>
          <p className={`${v1Typography.supporting} ${roles.text.supporting}`}>
            {content.description}
          </p>
        </div>
        {content.supporting && (
          <p
            className={`${v1Typography.supporting} ${roles.text.supporting} mt-2`}
          >
            {content.supporting}
          </p>
        )}
      </div>
    </TransactionSidecar>
  )
}

const REVIEW_ADVISORY_CONTENT = {
  capacity: {
    badge: 'Warning',
    title: 'Order too large',
    description:
      'You can buy up to $200,000 per transaction during regular hours in the US. For larger amounts, split your order into multiple transactions.',
    supporting: undefined,
  },
  'closed-error': {
    badge: 'Trading unavailable',
    title: 'Temporarily unavailable',
    description:
      "Minting CMC20 is currently unavailable and we couldn't find another route to buy it. Try again later when trading resumes.",
    supporting: undefined,
  },
  'closed-impact': {
    badge: 'High price impact',
    title: 'Expect a worse price',
    description:
      "You're getting a worse price than usual because CMC20's underlying stocks aren't trading right now.",
    supporting:
      'US stock market hours are 9:30 AM to 4:00 PM Eastern Time. Current time is: 6:12 PM ET. Please try again in 2 hours.',
  },
} as const
