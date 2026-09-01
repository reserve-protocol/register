import { Button } from '@/components/button'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import {
  InlineMessage,
  InlineMessageActions,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'

const InlineMessageStateSheet = () => (
  <section
    data-testid="inline-message-state-sheet"
    className="space-y-6"
    aria-labelledby="inline-message-state-sheet-title"
  >
    <div>
      <p className="text-sm font-medium text-muted-foreground">
        Context-blocked exploration
      </p>
      <h2
        id="inline-message-state-sheet-title"
        className="mt-1 text-xl font-medium"
      >
        Persistent contextual feedback
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        This isolated grid compares implementation anatomy only. It is not a
        canonical review surface until source-grounded content before and after
        each message makes its prominence, spacing, and density judgeable.
      </p>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <CandidateCell label="Information · requirements">
        <InlineMessage tone="information">
          <InlineMessageTitle>Proposal requirements</InlineMessageTitle>
          <InlineMessageDescription className="mt-1">
            Review the proposal details and executable actions before voting.
          </InlineMessageDescription>
        </InlineMessage>
      </CandidateCell>

      <CandidateCell label="Success · validation summary">
        <InlineMessage tone="success">
          <InlineMessageTitle>Basket weights are valid</InlineMessageTitle>
          <InlineMessageDescription className="mt-1">
            All token weights add up to 100%.
          </InlineMessageDescription>
        </InlineMessage>
      </CandidateCell>

      <CandidateCell label="Warning · temporary condition">
        <InlineMessage tone="warning">
          <InlineMessageTitle>Trading paused</InlineMessageTitle>
          <InlineMessageDescription className="mt-1">
            Some basket assets are outside trading hours. Minting and redeeming
            will resume when their markets reopen.
          </InlineMessageDescription>
        </InlineMessage>
      </CandidateCell>

      <CandidateCell label="Danger · recoverable error">
        <InlineMessage tone="danger" role="alert">
          <InlineMessageTitle>One or more approvals failed</InlineMessageTitle>
          <InlineMessageDescription className="mt-1">
            Retry the failed approvals before continuing.
          </InlineMessageDescription>
          <InlineMessageActions>
            <Button size="compact">Retry approvals</Button>
          </InlineMessageActions>
        </InlineMessage>
      </CandidateCell>
    </div>

    <section
      className="bg-card p-6"
      aria-labelledby="inline-message-compact-title"
    >
      <div className="max-w-xl">
        <h3 id="inline-message-compact-title" className="text-xl font-medium">
          Compact in-flow warning
        </h3>
        <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
          Compact density supports short, persistent guidance inside a bounded
          task. It is not a smaller substitute for a title-and-action message.
        </p>
        <div className="mt-4 grid gap-3">
          <InlineMessage
            density="compact"
            presentation="summary"
            tone="warning"
          >
            <InlineMessageTitle>Trading paused</InlineMessageTitle>
            <HelpTooltip
              accessibleLabel="About the trading pause"
              content="Some basket assets are outside trading hours. Minting and redeeming will resume when their markets reopen."
            />
          </InlineMessage>
          <InlineMessage density="compact" tone="warning">
            <InlineMessageDescription>
              This DTF contains assets with relatively low DEX liquidity.
            </InlineMessageDescription>
          </InlineMessage>
        </div>
      </div>
    </section>

    <p className="border border-border bg-card p-4 text-sm font-light leading-5 text-muted-foreground">
      Inline Message is persistent by default and owns no generic close action.
      Use Toast for routine transient confirmation. Transaction progress, retry
      orchestration, field validation, compliance policy, and production
      migration remain composition-owned. A visual danger tone alone does not
      create urgent announcement semantics; use{' '}
      <code>role=&quot;alert&quot;</code>
      only when newly inserted content requires immediate announcement.
    </p>
  </section>
)

const CandidateCell = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="min-w-0 bg-card">
    <p className="border-b border-border px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="flex min-h-44 items-center p-6">{children}</div>
  </div>
)

export default InlineMessageStateSheet
