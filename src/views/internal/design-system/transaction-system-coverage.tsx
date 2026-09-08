import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

import {
  TransactionSystemStatus,
  type TransactionSystemPartStatus,
} from './transaction-system-status'

export const TransactionSystemCoverage = () => (
  <section
    data-testid="transaction-coverage-map"
    className="border border-border bg-card"
    aria-labelledby="transaction-coverage-map-title"
  >
    <header className="border-b border-border p-4 sm:p-6">
      <p className={cn(v1Typography.label, 'text-primary')}>Audit coverage</p>
      <h3
        id="transaction-coverage-map-title"
        className="mt-1 text-xl font-medium"
      >
        Where each important transaction job is exercised
      </h3>
      <p
        className={cn(
          'mt-1 max-w-4xl',
          v1Typography.supporting,
          roles.text.supporting
        )}
      >
        The audit is the inventory. A row may point to a realistic composition,
        an existing owner, or an explicit blocker; nothing silently disappears
        because every permutation is not rendered.
      </p>
    </header>
    <div className="divide-y divide-border">
      {COVERAGE_ITEMS.map((item) => (
        <div
          key={item.requirement}
          data-testid="transaction-coverage-item"
          className="grid gap-3 p-4 sm:px-6 lg:grid-cols-[minmax(13rem,0.7fr)_minmax(0,1.3fr)_auto] lg:items-center"
        >
          <div>
            <p className={v1Typography.label}>{item.requirement}</p>
            <p className={cn(v1Typography.supporting, roles.text.supporting)}>
              {item.kind}
            </p>
          </div>
          <p className={cn(v1Typography.supporting, roles.text.supporting)}>
            {item.coverage}
          </p>
          <TransactionSystemStatus status={item.status} />
        </div>
      ))}
    </div>
  </section>
)

const COVERAGE_ITEMS: {
  requirement: string
  kind: string
  coverage: string
  status: TransactionSystemPartStatus
}[] = [
  {
    requirement: 'Amount and input/output anatomy',
    kind: 'Shared candidate',
    coverage:
      'Manual mint, automated Mint/Redeem, Stake/Unstake, Zapper, and Vote Lock/Unlock compositions.',
    status: 'Proposed candidate',
  },
  {
    requirement: 'Balance, Max, precision, and validation',
    kind: 'Shared candidate plus existing Field semantics',
    coverage:
      'Manual and automated Mint/Redeem exercise operation-specific wallet balance and Max; amount precision, read-only output, and supporting estimates use the same Amount candidate while invalid Field behavior remains canonical.',
    status: 'Proposed candidate',
  },
  {
    requirement: 'Local asset selection',
    kind: 'Shared candidate and recipe',
    coverage:
      'Unreviewed standalone static selector specimen; search and confirmation are not wired here. Working Zapper selection is exercised inside its own flow and does not approve this separate composition.',
    status: 'Proposed candidate',
  },
  {
    requirement: 'Selector loading, empty, and unsupported states',
    kind: 'Unrendered selector-state follow-up',
    coverage:
      'Loading, empty, and unsupported selector states remain deferred; this board only exercises selected, unselected, balance, and long-identity rows.',
    status: 'Deferred',
  },
  {
    requirement: 'Approval and requirement rows',
    kind: 'Shared candidate',
    coverage:
      'Manual mint renders five per-asset requirements, independent approval/revoke progress and failed-only retry through lab simulation. Vote Lock and Stake retain conditional approval before the primary transaction. Production approval policy remains engineering-owned.',
    status: 'Proposed candidate',
  },
  {
    requirement: 'Wallet, chain, and compliance prerequisites',
    kind: 'Existing behavior seam',
    coverage:
      'Existing TransactionButton, SeamlessTransactionContainer, automated capability gate, and Zapper host remain the owners. Vote Lock intentionally remains outside compliance gating.',
    status: 'Retained current',
  },
  {
    requirement: 'Action-required versus waiting language',
    kind: 'Shared candidate',
    coverage:
      'Conditional Stake and Vote Lock approval, package open order, automated recovery, delayed initiation and Manual approval waiting/recovery distinguish a busy initiated action from a separate gated upcoming action.',
    status: 'Proposed candidate',
  },
  {
    requirement: 'Quote, fee, slippage, and estimate qualifiers',
    kind: 'Shared hierarchy with flow-owned truth',
    coverage:
      'Fee and estimate qualifiers are visible. Minimum received and slippage remain package- or flow-owned and are not rendered as shared patterns here.',
    status: 'Flow-owned',
  },
  {
    requirement: 'Transaction and order identity',
    kind: 'Shared candidate',
    coverage:
      'Automated issuance keeps each submitted CoW identity with its quoted sell amount, estimated buy amount, and status, then completion links the separate final mint or redeem transaction. Stake/Unstake and Vote Lock outcomes show their primary transaction identity. Manual renders an explicit explorer simulation without fabricating a hash; real result sourcing remains engineering-owned. Approval transactions stay omitted, and RFQ order identity remains package-owned.',
    status: 'Proposed candidate',
  },
  {
    requirement: 'Consequential outcome composition',
    kind: 'Independent family compositions',
    coverage:
      'RFQ, automated, Stake, Unstake, single-role Stake delegation, Vote Lock, Vote Unlock, and Vote Lock delegation one/two-change outcomes are rendered independently. Manual Mint and Redeem outcomes are rendered with submitted shares and explicitly expected basket values; executed result truth and production adoption remain deferred.',
    status: 'Flow-owned',
  },
  {
    requirement: 'Inline recovery in context',
    kind: 'Provisional feedback candidate',
    coverage:
      'Pausing quote search preserves the input, quote failure offers fetch/edit recovery, and automated order expiry preserves the filled order while retrying only the failed leg. Wallet rejection and other cancellation consequences remain beside their task context.',
    status: 'Proposed candidate',
  },
  {
    requirement: 'Transparent staged progress',
    kind: 'Composition recipe plus flow-owned rows',
    coverage:
      'Automated Mint/Redeem keep high-level collateral work and terminal output in the left task sections, while operation policy preserves Mint’s separate final action and Redeem’s atomic redeem boundary. The right workspace owns flow-specific CoW row phases including prepared, independent waiting and fill, failure, and completed evidence.',
    status: 'Flow-owned',
  },
  {
    requirement: 'Partial success and retry scope',
    kind: 'Flow-owned recovery',
    coverage:
      'Automated WBTC completion and existing wallet collateral remain intact while only the expired WETH order is retried. Manual retains completed permissions while retrying failed tokens. Delegation preserves a completed normal update when the following fast update fails and scopes Update to the remaining change.',
    status: 'Flow-owned',
  },
  {
    requirement: 'Delayed settlement across visits',
    kind: 'Immediate handoff plus deferred page work',
    coverage:
      'Unstake and Vote Unlock outcomes communicate the initiated delay, pending amount, timing, and later action. Persistent cooldown, claimable, cancel, and withdrawal management remain page-owned and deferred to contextual row and table review.',
    status: 'Deferred',
  },
  {
    requirement: 'Stable action area and responsive shell hierarchy',
    kind: 'Current component plus composition recipe',
    coverage:
      'Page workflows retain page actions, package actions remain upstream, and the Stake proof keeps transaction content independent from the host that supplies overlay, placement, focus, and dismissal. The lab mounts its full lifecycle in a dialog without requiring production entry to begin there.',
    status: 'Current baseline',
  },
  {
    requirement: 'Responsive task and selector shells',
    kind: 'Viewport behavior dependency',
    coverage:
      'Vote Lock and Stake use the shared contained lab host to exercise current focus, dismissal, and responsive placement around separate flow-owned tasks. Exercise the canonical mounted Dialog primitive separately before production adoption.',
    status: 'Deferred',
  },
  {
    requirement: 'Package-owned Zapper lifecycle',
    kind: 'Upstream boundary',
    coverage:
      'RFQ is a bounded visual reference against the installed package, not a behavioral reimplementation or a Register V1 component candidate.',
    status: 'Upstream-owned',
  },
  {
    requirement: 'Guarded dismissal and restoration',
    kind: 'Engineer and interaction dependency',
    coverage:
      'Requires per-flow reconstruction and safe-dismissal answers before an interactive contract can be reviewed.',
    status: 'Deferred',
  },
  {
    requirement: 'Confirm Deploy result truth',
    kind: 'P0 engineer dependency',
    coverage:
      'The responsive shell direction is documented, but amount correctness and multi-asset readiness block result authority.',
    status: 'Deferred',
  },
]
