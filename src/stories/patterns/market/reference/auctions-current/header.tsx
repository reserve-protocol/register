import type { RefObject } from 'react'
import { Link } from '@/components/design-system-v1/link'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { RecordProvenance } from '../auctions-browse/record-provenance'
import { timeRemaining, type WorkspaceState } from './model'
import type { SourceRecord } from './fixtures'
import { RebalanceInspection } from './inspection'

export function CurrentHeader({
  record,
  state,
  heading,
}: {
  record: SourceRecord
  state: WorkspaceState
  heading: RefObject<HTMLHeadingElement>
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2 px-6 pt-6">
      <h3
        ref={heading}
        tabIndex={-1}
        className={cn(type.panelTitle, 'outline-none')}
      >
        <Link
          treatment="contextual"
          className={cn(type.panelTitle, 'whitespace-normal')}
          href={`/${record.chainId === 56 ? 'bsc' : 'base'}/index-dtf/${record.address}/governance/proposal/${record.identity.id}`}
        >
          {record.identity.title}
        </Link>
      </h3>
      <div className="col-start-2 row-start-1 justify-self-end [@container(min-width:32rem)]:row-span-2 [@container(min-width:32rem)]:self-center">
        <RebalanceInspection record={record} state={state} />
      </div>
      <div
        data-testid="current-header-metadata"
        className={cn(
          type.supporting,
          'col-span-2 flex flex-col items-start gap-x-2 gap-y-1 text-muted-foreground [@container(min-width:32rem)]:col-span-1 [@container(min-width:32rem)]:flex-row [@container(min-width:32rem)]:flex-wrap [@container(min-width:32rem)]:items-center'
        )}
      >
        <RecordProvenance
          identity={record.identity}
          loading={false}
          compactDate
          chainId={record.chainId}
          className="mt-0"
        />
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="hidden [@container(min-width:32rem)]:inline"
          >
            ·
          </span>
          {state.now >= record.identity.availableUntil ? (
            <span className={cn(type.supporting, 'text-muted-foreground')}>
              Ended
            </span>
          ) : (
            <span className="whitespace-nowrap">
              Expires in{' '}
              <span
                data-testid="current-expiry"
                className={cn(type.label, 'text-foreground')}
              >
                {timeRemaining(record.identity.availableUntil - state.now)}
              </span>
            </span>
          )}
        </span>
      </div>
    </header>
  )
}
