import { v1SemanticRoles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography } from '@/components/design-system-v1/typography'
import { Link } from '@/components/design-system-v1/link'
import { X } from 'lucide-react'

import { transactionAttachedRegionGeometry } from '@/components/design-system-v1/transaction-task-geometry'

export const TransactionReviewAdvisory = ({
  onDismiss,
  variant = 'closed-impact',
}: {
  onDismiss: () => void
  variant?: 'capacity' | 'closed-error' | 'closed-impact' | 'cow-redirect'
}) => {
  const content = REVIEW_ADVISORY_CONTENT[variant]

  return (
    <aside
      data-testid="transaction-review-advisory"
      data-entrance="immediate"
      className={`${transactionAttachedRegionGeometry.surface} relative z-0 flex w-full origin-top flex-col p-6 text-left [animation:transaction-attached-region-grow-down_360ms_ease-out_both] motion-reduce:animate-none`}
    >
      <div data-testid="zapper-review-advisory" className="grid gap-2">
        <div className="grid gap-1">
          <div className="flex items-center justify-between gap-4">
            <h4
              className={`${v1Typography.itemTitle} ${v1SemanticRoles.feedback.warning.foreground}`}
            >
              {content.title}
            </h4>
            <AdvisoryDismissAction onDismiss={onDismiss} />
          </div>
          <p
            className={`${v1Typography.supporting} ${v1SemanticRoles.text.supporting}`}
          >
            {content.description}
          </p>
          {content.supporting && (
            <p
              className={`${v1Typography.supporting} ${v1SemanticRoles.text.supporting} mt-1`}
            >
              {content.supporting}
            </p>
          )}
        </div>
        {content.action && (
          <Link
            className="w-fit"
            external
            externalAnnouncement=", opens in a new tab"
            href={content.action.href}
            treatment="standalone"
          >
            {content.action.label}
          </Link>
        )}
      </div>
    </aside>
  )
}

const AdvisoryDismissAction = ({ onDismiss }: { onDismiss: () => void }) => (
  <button
    type="button"
    aria-label="Dismiss suggestion"
    onClick={onDismiss}
    className={`relative inline-flex size-5 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-120 after:absolute after:-inset-3 after:content-[''] hover:bg-muted active:bg-border/50 focus-visible:outline-none ${v1SemanticRoles.focus.visibleOnContent}`}
  >
    <X aria-hidden="true" className="size-4 stroke-[1.5]" />
  </button>
)

const REVIEW_ADVISORY_CONTENT = {
  capacity: {
    title: 'Order too large',
    description: (
      <>
        You can buy{' '}
        <strong className="font-medium text-foreground tabular-nums">
          up to $200,000 per transaction
        </strong>{' '}
        during regular hours in the US. For larger amounts, split your order
        into multiple transactions.
      </>
    ),
    supporting: undefined,
    action: undefined,
  },
  'closed-error': {
    title: 'Temporarily unavailable',
    description: (
      <>
        Minting CMC20 is currently unavailable and we couldn&apos;t find another
        route to buy it.{' '}
        <strong className="font-medium text-foreground">
          Try again later when trading resumes.
        </strong>
      </>
    ),
    supporting: undefined,
    action: undefined,
  },
  'closed-impact': {
    title: 'Expect a worse price',
    description:
      "You're getting a worse price than usual because CMC20's underlying stocks aren't trading right now.",
    supporting: (
      <>
        US stock market hours are 9:30 AM to 4:00 PM Eastern Time. Current time
        is: 6:12 PM ET.{' '}
        <strong className="font-medium text-foreground">
          Please try again in 2 hours.
        </strong>
      </>
    ),
    action: undefined,
  },
  'cow-redirect': {
    title: 'Try CoW Swap',
    description: (
      <>
        For larger orders, a DEX aggregator like CoW Swap{' '}
        <strong className="font-medium text-foreground">
          may get you a better price
        </strong>{' '}
        by routing your trade across multiple sources of liquidity.
      </>
    ),
    supporting: undefined,
    action: {
      label: 'Open CoW Swap',
      href: 'https://swap.cow.fi/#/56/swap/0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d/0x2f8a339b5889ffac4c5a956787cda593b3c36867',
    },
  },
} as const
