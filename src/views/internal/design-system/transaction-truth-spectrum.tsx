import { v1Typography } from '@/components/design-system-v1/typography'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
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
      <p
        className={cn(
          'max-w-4xl',
          v1Typography.supporting,
          roles.text.supporting
        )}
      >
        The action-to-outcome truth spectrum remains the shared language, but
        the primary review surfaces now preserve the input, output, identity,
        details, action hierarchy, execution, recovery, and outcome each family
        actually needs. Use each composition’s state control to inspect the same
        task without comparing disconnected specimens.
      </p>
    </header>

    <TransactionSystemStatusLegend />
    <TransactionPredecessorContract />
    <TransactionCurrentFlowContract />
    <TransactionPairedReview />

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
        <p
          className={cn(
            'max-w-4xl',
            v1Typography.supporting,
            roles.text.supporting
          )}
        >
          Four families remain comparison anchors, not templates for one
          universal flow. Manual mint supplies the richest local atomic seam;
          the installed Zapper remains upstream; automated mint owns transparent
          orders; Stake and Unstake test conditional approval, immediate
          receipt, and delayed initiation inside a host-independent task. Vote
          Lock is the focused fifth composition, grounded directly in its
          current lock, unlock, and explicit delegation implementations. Later
          Portfolio and staking management rows remain product evidence rather
          than review specimens here.
        </p>
      </header>
      <AtomicTransactionComposition />
      <RfqTransactionComposition />
      <StagedTransactionComposition />
      <StakeTransactionComposition />
      <VoteLockTransactionComposition />
    </section>

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
          truth, queue indexes, guarded dismissal, post-receipt synchronization,
          package callbacks, and Confirm Deploy correctness.
        </li>
      </ul>
    </section>
  </section>
)

export default TransactionTruthSpectrum
