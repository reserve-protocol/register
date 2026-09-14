import { Link as RouterLink } from 'react-router-dom'
import type { ReactNode, SyntheticEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { Trans, useLingui } from '@lingui/react/macro'
import { Button } from '@/components/button'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { RecordProvenance } from '../auctions-browse/record-provenance'
import type { TableRow } from './model'

export function CurrentIdentity({ row }: { row: TableRow }) {
  return (
    <div className="min-w-0">
      <div className={cn(type.itemTitle, '[overflow-wrap:anywhere]')}>
        {row.record.identity.title}
      </div>
      <RecordProvenance
        identity={row.record.identity}
        chainId={row.record.chainId}
        loading={false}
        compactDate
        focusKey={row.previewId}
        className="mt-1 block"
      />
    </div>
  )
}

export function CurrentStatus({
  row,
  detail = false,
}: {
  row: TableRow
  detail?: boolean
}) {
  const showInstruction =
    row.instructionPlacement === 'status' ||
    (detail && row.instructionPlacement === 'detail')
  const compactRestriction =
    !detail && showInstruction && row.status === 'Confirm target weights'
  return (
    <div className="space-y-2" data-testid="current-table-status">
      <div className="flex items-center gap-3">
        <LifecycleStatusPill role={row.role}>
          {row.status === 'Ready to start' ? (
            row.launchAccess === 'launcher' ? (
              <Trans>Only launcher can start</Trans>
            ) : (
              <Trans>Anyone can start</Trans>
            )
          ) : row.status === 'Confirm target weights' ? (
            <Trans>Confirm target weights</Trans>
          ) : (
            row.status
          )}
        </LifecycleStatusPill>
        {row.status === 'Ready to start' && row.launchAccess === 'launcher' && (
          <LauncherHelp previewId={row.previewId}>
            <Trans>
              The auction launcher is the account authorized to start auctions
              during the restricted period.
            </Trans>
          </LauncherHelp>
        )}
      </div>
      {compactRestriction ? (
        <div
          className={cn(
            type.supporting,
            'flex items-center gap-3 text-muted-foreground'
          )}
        >
          <span data-testid="current-table-access-summary">
            <Trans>Only launcher can start</Trans>
          </span>
          <LauncherHelp previewId={row.previewId}>
            {row.instruction ===
            'Community launch is not available for this rebalance' ? (
              <Trans>
                Community launch is not available for this rebalance
              </Trans>
            ) : (
              <Trans>Only the auction launcher can start auctions</Trans>
            )}
          </LauncherHelp>
        </div>
      ) : (
        showInstruction &&
        row.instruction && (
          <p className={cn(type.supporting, 'max-w-64 text-muted-foreground')}>
            {row.instruction}
          </p>
        )
      )}
    </div>
  )
}

function LauncherHelp({
  previewId,
  children,
}: {
  previewId: string
  children: ReactNode
}) {
  const { t } = useLingui()
  return (
    <span
      className="inline-flex shrink-0"
      data-testid="current-table-launcher-help"
      data-table-focus={`launcher-help-${previewId}`}
      onPointerDownCapture={preserveHelpToggle}
      onClickCapture={preserveHelpToggle}
      onClick={(event) => event.stopPropagation()}
    >
      <HelpTooltip
        accessibleLabel={t`Only launcher can start`}
        content={children}
      />
    </span>
  )
}

function preserveHelpToggle(event: SyntheticEvent) {
  // Radix's trigger defaults otherwise close the explicit tap toggle immediately.
  if ((event.target as Element).closest('button')) event.preventDefault()
}

export function CurrentRound({ row }: { row: TableRow }) {
  return (
    <div className="space-y-1" data-testid="current-table-round">
      <div className={type.body}>
        {row.round === null ? '—' : `Auction ${row.round}`}
      </div>
      {(row.event || row.instructionPlacement === 'auction') && (
        <div
          className={cn(
            type.supporting,
            'flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground'
          )}
        >
          {row.event && (
            <div>
              <span>{row.event.label}</span>{' '}
              <span className="whitespace-nowrap font-medium tabular-nums text-foreground">
                {row.event.value}
              </span>
            </div>
          )}
          {row.instructionPlacement === 'auction' && (
            <span className="whitespace-nowrap">{row.instruction}</span>
          )}
        </div>
      )}
    </div>
  )
}

export function CurrentDetails({ row, href }: { row: TableRow; href: string }) {
  return (
    <span className="inline-flex size-11 items-center justify-center">
      <Button
        asChild
        tone="secondary"
        size="compact"
        className="relative w-8 px-0 before:absolute before:left-1/2 before:top-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
      >
        <RouterLink
          to={href}
          state={{ currentTableOrigin: true }}
          data-table-focus={`details-${row.previewId}`}
          aria-label="Details"
        >
          <ArrowRight aria-hidden className="size-4" />
        </RouterLink>
      </Button>
    </span>
  )
}
