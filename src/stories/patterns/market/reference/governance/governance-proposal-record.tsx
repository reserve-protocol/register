import { useId, useRef, type SyntheticEvent } from 'react'
import { Clock, Shield, Zap } from 'lucide-react'
import ProposalStatusBar from '@/components/proposal-status-bar'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { cn } from '@/lib/utils'
import { DecisionEvidence } from './governance-proposal-evidence'
import type { GovernanceProposalFixture } from './governance-proposal-state-fixtures'

export function GovernanceProposalRecord({
  record,
}: {
  record: GovernanceProposalFixture
}) {
  const statusId = useId()
  const dismissingHelp = useRef(false)
  const current = record.progressEmphasis !== 'quiet'
  return (
    <article
      data-testid="rich-record"
      data-record-kind="governance"
      data-proposal-state={record.state}
      data-proposal-kind={record.kind}
      data-progress-emphasis={record.progressEmphasis}
      className={cn(
        'group relative [container-type:inline-size] [&:has(a:focus-visible)]:ring-2 [&:has(a:focus-visible)]:ring-inset [&:has(a:focus-visible)]:ring-ring',
        roles.interaction.contentHover,
        v1LayoutRecipes.inset.ordinaryContent,
        v1LayoutRecipes.stack.internalRegions
      )}
      onPointerDownCapture={(event) => {
        // Remember the outside tap before Radix dismisses on pointerdown.
        dismissingHelp.current =
          event.pointerType === 'touch' &&
          !(event.target as Element).closest('button') &&
          !!event.currentTarget.querySelector(
            '[data-testid="proposal-help"] button[data-state$="open"]'
          )
      }}
      onClickCapture={(event) => {
        if (dismissingHelp.current && event.detail > 0) event.preventDefault()
        dismissingHelp.current = false
      }}
    >
      <div className="flex flex-col items-start justify-between gap-2 [@container(min-width:28rem)]:flex-row [@container(min-width:28rem)]:gap-4">
        {record.qualifier && (
          <span
            data-proposal-qualifier={record.qualifier}
            className="flex shrink-0 items-center gap-1 text-sm font-medium leading-5 text-muted-foreground"
          >
            {record.qualifier === 'fast' ? (
              <Zap className="size-3.5 stroke-[1.5]" />
            ) : (
              <Shield className="size-3.5 stroke-[1.5]" />
            )}
            {record.qualifier === 'fast' ? 'Fast' : 'Contested'}
          </span>
        )}
        <h4 className="w-full min-w-0 text-base font-medium leading-6 text-foreground [@container(min-width:28rem)]:order-first">
          <a
            data-testid="proposal-record-link"
            href="/bsc/index-dtf/cmc20/governance"
            target="_blank"
            rel="noreferrer"
            aria-describedby={statusId}
            className="outline-none after:absolute after:inset-0 after:z-0"
          >
            {record.title}
          </a>
        </h4>
      </div>
      <div className="pointer-events-none relative space-y-2">
        <div
          id={statusId}
          data-testid="proposal-status-group"
          className="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm font-light leading-5"
        >
          <div className="inline-flex max-w-full items-center gap-3">
            {record.statuses.map((status, index) => (
              <LifecycleStatusPill
                key={index}
                role={status.role}
                indicator={status.indicator}
              >
                {status.label}
              </LifecycleStatusPill>
            ))}
            {current && <ProposalHelp record={record} />}
          </div>
          {record.countdown && (
            <span
              data-testid="proposal-countdown"
              className={cn(
                'inline-flex max-w-full items-center gap-1 tabular-nums',
                record.countdown.deadline
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {record.countdown.deadline && (
                <Clock aria-hidden="true" className="mr-1 size-3.5 shrink-0" />
              )}
              <span>{record.countdown.label}</span>{' '}
              <strong className="shrink-0 font-medium text-foreground">
                {record.countdown.value}
              </strong>
            </span>
          )}
          {record.outcome && (
            <span
              data-testid="proposal-outcome"
              className="text-muted-foreground"
            >
              Passed
            </span>
          )}
        </div>
        {current && (
          <ProposalStatusBar
            className="!h-1 [&>svg]:!h-1"
            stages={record.stages}
          />
        )}
      </div>
      <div className="pointer-events-none relative text-sm leading-5">
        <DecisionEvidence evidence={record.evidence} />
      </div>
    </article>
  )
}

function ProposalHelp({ record }: { record: GovernanceProposalFixture }) {
  return (
    <span
      data-testid="proposal-help"
      className="pointer-events-auto relative z-10 inline-flex shrink-0"
      onPointerDownCapture={preserveHelpToggle}
      onClickCapture={preserveHelpToggle}
    >
      <HelpTooltip
        accessibleLabel={
          record.waitingPeriod ? 'Waiting period' : 'Proposal timeline'
        }
        content={
          <div className="space-y-2">
            {record.waitingPeriod && (
              <p>
                The proposal passed and is in its required execution delay
                (timelock). Execution becomes available when this period ends;
                it does not happen automatically.
              </p>
            )}
            <p>The strip represents lifecycle timing, not voting support.</p>
            <p>
              {record.kind === 'optimistic' ? (
                <>Challenge period</>
              ) : (
                <>Voting delay → Voting → Execution delay</>
              )}
            </p>
          </div>
        }
      />
    </span>
  )
}

function preserveHelpToggle(event: SyntheticEvent) {
  // Radix trigger defaults otherwise close the explicit tap toggle immediately.
  if ((event.target as Element).closest('button')) event.preventDefault()
}
