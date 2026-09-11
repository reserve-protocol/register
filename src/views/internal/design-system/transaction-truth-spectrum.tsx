import { Button } from '@/components/button'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'

import { AtomicTransactionComposition } from './transaction-composition-atomic'
import { StakeTransactionComposition } from './transaction-composition-stake'
import { RfqTransactionComposition } from './transaction-composition-rfq'
import { StagedTransactionComposition } from './transaction-composition-staged'
import { VoteLockTransactionComposition } from './transaction-composition-vote-lock'
import { TransactionSystemCoverage } from './transaction-system-coverage'
import { TransactionSystemPressureTests } from './transaction-system-pressure-tests'
import { TransactionSystemStatusLegend } from './transaction-system-status'
import { TransactionPredecessorContract } from './transaction-predecessor-contract'
import { TransactionCurrentFlowContract } from './transaction-current-flow-contract'
import { TransactionPairedReview } from './transaction-paired-review'

const TransactionTruthSpectrum = () => (
  <section
    id="transaction-truth-spectrum"
    data-testid="transaction-system-review"
    className={v1LayoutRecipes.stack.majorRegions}
    aria-labelledby="transaction-system-review-title"
  >
    <header className={v1LayoutRecipes.stack.tightText}>
      <p className={cn(v1Typography.label, 'text-primary')}>
        Exploratory transaction-system review
      </p>
      <h2 id="transaction-system-review-title" className="text-xl font-medium">
        Transaction families in realistic composition
      </h2>
    </header>

    <TransactionReviewNavigation />

    <section
      className={v1LayoutRecipes.stack.completeGroups}
      aria-labelledby="representative-transaction-compositions-title"
    >
      <header className={v1LayoutRecipes.stack.tightText}>
        <h3
          id="representative-transaction-compositions-title"
          className="text-xl font-medium"
        >
          Representative transaction compositions
        </h3>
      </header>
      <RfqTransactionComposition />
      <StagedTransactionComposition />
      <StakeTransactionComposition />
      <VoteLockTransactionComposition />
    </section>

    <TransactionPairedReview />
    <AtomicTransactionComposition />
    <TransactionSystemStatusLegend />
    <TransactionPredecessorContract />
    <TransactionCurrentFlowContract />
    <TransactionSystemPressureTests />
    <TransactionSystemCoverage />

    <section className="border border-border bg-card p-4 sm:p-6">
      <p className={v1Typography.label}>Unresolved decisions for this review</p>
      <ul
        className={cn(
          'mt-2 max-w-4xl list-disc space-y-1 pl-5',
          v1Typography.supporting,
          roles.text.supporting
        )}
      >
        <li>
          Judge only the declared transaction pressure: relationship geometry is
          provisionally reusable, accepted components keep their current
          contracts, and flow-local or exploratory treatments do not become
          authority from appearing in this board.
        </li>
        <li>
          Judge whether the compositions share enough hierarchy without making
          atomic work ceremonial or hiding legitimate automated detail.
        </li>
        <li>
          Engineer review still owns exact result sourcing, partial multi-call
          truth, queue indexes, dialog-hosted guarded dismissal, post-receipt
          synchronization, package callbacks, and Confirm Deploy correctness.
        </li>
      </ul>
    </section>
  </section>
)

const TransactionReviewNavigation = () => (
  <nav
    aria-labelledby="transaction-system-review-title"
    className="sticky top-14 z-10 -mx-4 border-y border-border bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6"
  >
    <div className="max-w-full overflow-x-auto">
      <div className="flex w-max items-center gap-1">
        {TRANSACTION_REVIEW_LINKS.map((item) => (
          <Button key={item.href} asChild size="compact" tone="quiet">
            <a href={item.href} aria-label={item.accessibleLabel}>
              {item.label}
            </a>
          </Button>
        ))}
      </div>
    </div>
  </nav>
)

const TRANSACTION_REVIEW_LINKS = [
  {
    label: 'Zapper',
    accessibleLabel: 'Instant Zapper',
    href: '#transaction-composition-rfq',
  },
  {
    label: 'Automated mint',
    accessibleLabel: 'Automated mint workspace',
    href: '#transaction-composition-staged',
  },
  {
    label: 'Stake',
    accessibleLabel: 'Stake, unstake, and delegate',
    href: '#transaction-composition-stake',
  },
  {
    label: 'Vote lock',
    accessibleLabel: 'Vote-lock, unlock, and delegate',
    href: '#transaction-composition-vote-lock',
  },
  {
    label: 'Compare',
    accessibleLabel: 'Instant Zapper and Vote Lock',
    href: '#transaction-paired-review',
  },
  {
    label: 'Manual mint',
    accessibleLabel: 'Manual mint',
    href: '#transaction-composition-atomic',
  },
  {
    label: 'Reference',
    accessibleLabel: 'How to read visible parts',
    href: '#transaction-review-reference',
  },
] as const

export default TransactionTruthSpectrum
