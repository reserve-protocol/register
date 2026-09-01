import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

const DISPOSITIONS = [
  'Preserve',
  'Standardize visually',
  'Consolidate',
  'Deliberately improve',
  'Do not touch yet',
] as const

const flows = [
  {
    name: 'Manual issuance',
    sources: [
      'src/views/index-dtf/issuance/manual/components/index-manual-issuance.tsx',
      'src/views/index-dtf/issuance/manual/components/asset-list.tsx',
    ],
    statements: [
      'Preserve|Editable share input, approval-to-mint action slot, and persistent per-asset requirements.',
      'Standardize visually|Amount field, requirement rows, permission statuses, actions, and confirmed result language.',
      'Consolidate|Asset identity, financial values, and transaction identity—not the approval sequence itself.',
      'Deliberately improve|A consequential in-context mint result is shown as a proposal; current product only toasts and resets.',
      'Do not touch yet|Buy/sell math, allowance batching, unlimited approval, and reset behavior.',
    ],
    guardrail:
      'No separate global timeline: approval progress belongs to the action slot and the affected asset rows.',
  },
  {
    name: 'Index DTF Zapper',
    sources: [
      'src/views/index-dtf/components/zapper/zapper-wrapper.tsx',
      '@reserve-protocol/react-zapper@2.8.0 README and installed type contract',
    ],
    statements: [
      'Preserve|One inline package widget with Buy/Sell, input/output, quote, approval or signature, waiting, and package result.',
      'Standardize visually|Only the Register-owned host surface and surrounding context.',
      'Consolidate|Shared lifecycle words and outcome truth at the package boundary.',
      'Deliberately improve|None inside the upstream widget in this review.',
      'Do not touch yet|Package selectors, quote economics, RFQ execution, expiry/refund behavior, and success internals.',
    ],
    guardrail:
      'The RFQ slice is a faithful package reference, not a locally owned transaction-flow proposal.',
  },
  {
    name: 'Automated mint',
    sources: [
      'src/views/index-dtf/issuance/async-mint/steps/configure-mint.tsx',
      'src/views/index-dtf/issuance/async-mint/steps/quote-summary.tsx',
      'src/views/index-dtf/issuance/async-mint/steps/success.tsx',
    ],
    statements: [
      'Preserve|The narrow configure step expands into quote review and orders only after a quote is requested.',
      'Standardize visually|Financial hierarchy, amount objects, action grouping, statuses, rows, and outcome presentation.',
      'Consolidate|Shared amount, identity, lifecycle, recovery, and outcome primitives around flow-owned orders.',
      'Deliberately improve|Composition polish without changing progressive disclosure or resume semantics.',
      'Do not touch yet|SDK quoting, order signing, retry scope, existing-collateral math, and final mint boundaries.',
    ],
    guardrail:
      'The narrow configure step expands; the orders workspace is not present before quote review.',
  },
  {
    name: 'Delayed unstake',
    sources: [
      'src/views/yield-dtf/staking/components/unstake/unstake-modal.tsx',
      'src/views/yield-dtf/staking/components/withdraw/index.tsx',
    ],
    statements: [
      'Preserve|The input page, review modal, and durable queue remain separate surfaces with separate jobs.',
      'Standardize visually|Input/output, task dialog, confirmation status, and the immediate cooldown handoff.',
      'Consolidate|Shared delayed-settlement language and transaction identity—not one combined lifecycle panel.',
      'Deliberately improve|Make initiation versus final withdrawal truth clearer while retaining the same mechanics.',
      'Do not touch yet|Persistent queue rows, later withdrawal actions, queue indexes, cancellation semantics, trading gates, and broader Yield staking architecture.',
    ],
    guardrail:
      'The modal confirms initiation; the page-owned queue persists across visits and exposes cancel or withdraw later.',
  },
  {
    name: 'Vote Lock',
    sources: [
      'src/components/vote-lock/drawer.tsx',
      'src/components/vote-lock/components/vote-lock.tsx',
      'src/components/vote-lock/components/vote-unlock.tsx',
      'src/components/vote-lock/hooks/use-vote-lock-quotes.ts',
      'src/components/vote-lock/components/submit-lock-button.tsx',
      'src/components/vote-lock/components/submit-unlock-button.tsx',
      'src/components/vote-lock/components/delegate.tsx',
      'src/components/vote-lock/components/submit-delegate-button.tsx',
      'src/components/vote-lock/hooks/use-vote-lock-drawer.ts',
      'src/views/index-dtf/governance/components/governance-vote-lock.tsx',
      'src/views/index-dtf/governance/views/proposal/hooks/use-delegate-state.ts',
      'src/views/portfolio-page/components/pending-withdrawals.tsx',
    ],
    statements: [
      'Preserve|One shared Lock, Unlock, and Delegate shell; ERC-4626 preview amounts; exchange rate; balances; configured delay; and form reset behavior.',
      'Standardize visually|Focused Dialog hierarchy, amount relationship, acknowledgement, canonical address fields, wallet instruction, confirmation, identity, and the immediate delayed-initiation outcome.',
      'Consolidate|Shell geometry, action placement, and lifecycle language plus delayed-state presentation—not SDK plans, share math, or Portfolio ownership.',
      'Deliberately improve|Keep consequential lock, unlock, and delegation results in context; preserve a successful normal update if the following fast update fails.',
      'Do not touch yet|Persistent Portfolio withdrawal rows, SDK builders, approval/deposit/redeem/delegate calls, self-delegation, optimistic-governance capability, refresh behavior, and final claim calldata.',
    ],
    guardrail:
      'No new required introduction: governance entry context and the lock acknowledgement explain Lock, while the delay and Portfolio return path stay adjacent to Unlock. Delegate remains the current third mode but keeps address-editing anatomy and truthful one/two-call execution; first-lock self-delegation remains an SDK-owned side effect, not a new user step.',
  },
] as const

export const TransactionCurrentFlowContract = () => (
  <section
    data-testid="transaction-current-flow-contract"
    className="border border-border bg-card"
    aria-labelledby="transaction-current-flow-contract-title"
  >
    <header className="border-b border-border p-4 sm:p-6">
      <p className={cn(v1Typography.label, 'text-primary')}>
        Direct implementation reconciliation
      </p>
      <h3
        id="transaction-current-flow-contract-title"
        className="mt-1 text-xl font-medium"
      >
        What the product structure authorizes
      </h3>
      <p
        className={cn(
          'mt-1 max-w-4xl',
          v1Typography.supporting,
          roles.text.supporting
        )}
      >
        The audit still supplies cross-flow requirements. These dispositions
        come from the current implementations themselves and prevent visual
        standardization from silently becoming interaction redesign.
      </p>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Disposition key">
        {DISPOSITIONS.map((item) => (
          <span
            key={item}
            className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </header>
    <div className="grid gap-px bg-border lg:grid-cols-2">
      {flows.map((flow) => (
        <article key={flow.name} className="bg-card p-4 sm:p-6">
          <h4 className={v1Typography.itemTitle}>{flow.name}</h4>
          <div className="mt-1 space-y-0.5">
            {flow.sources.map((source) => (
              <p
                key={source}
                className={cn(
                  'break-all font-mono text-xs leading-4',
                  roles.text.supporting
                )}
              >
                {source}
              </p>
            ))}
          </div>
          <dl className="mt-4 space-y-3">
            {flow.statements.map((statement) => {
              const [label, detail] = statement.split('|')
              return (
                <div key={statement}>
                  <dt className={v1Typography.label}>{label}</dt>
                  <dd
                    className={cn(
                      'mt-0.5',
                      v1Typography.supporting,
                      roles.text.supporting
                    )}
                  >
                    {detail}
                  </dd>
                </div>
              )
            })}
          </dl>
          <p
            className={cn(
              'mt-4 border-t border-border pt-3',
              v1Typography.supporting,
              roles.text.supporting
            )}
          >
            {flow.guardrail}
          </p>
        </article>
      ))}
    </div>
  </section>
)
