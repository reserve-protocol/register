import type { Dispatch } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button, InlineAction } from '@/components/button'
import { Link } from '@/components/design-system-v1/link'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/design-system-v1/popover'
import {
  InlineMessage,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { Fact } from './facts'
import type { SourceRecord } from './fixtures'
import type { WorkspaceState, WorkspaceEvent } from './model'

export function RebalanceInspection({ record }: { record: SourceRecord }) {
  const explorer =
    record.chainId === 56 ? 'https://bscscan.com' : 'https://basescan.org'
  return (
    <Popover>
      <PopoverTrigger asChild>
        <InlineAction
          treatment="contextual"
          data-testid="current-inspect"
          aria-label="Rebalance information"
          className={cn(type.supporting, 'group min-h-11 before:inset-0')}
        >
          Details
          <ChevronDown
            aria-hidden
            className="size-4 shrink-0 transition-transform duration-120 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          />
        </InlineAction>
      </PopoverTrigger>
      <PopoverContent
        data-testid="current-rebalance-information"
        align="end"
        className="w-96 space-y-3 overflow-y-auto p-4"
        aria-label="Rebalance information"
      >
        <p className={type.itemTitle}>Rebalance information</p>
        <dl className="space-y-3 py-2">
          <Fact label="Rebalance nonce">{record.identity.nonce}</Fact>
          <Fact label="Available until">
            <time
              dateTime={new Date(
                record.identity.availableUntil * 1000
              ).toISOString()}
            >
              {new Date(record.identity.availableUntil * 1000).toLocaleString(
                'en-US',
                { dateStyle: 'medium', timeStyle: 'short' }
              )}
            </time>
          </Fact>
          <Fact label="DTF">
            <Link
              href={`${explorer}/address/${record.address}`}
              external
              externalAnnouncement="Opens in a new tab"
              treatment="standalone"
            >
              {record.symbol}
            </Link>
          </Fact>
          <Fact label="Transaction">
            <Link
              href={`${explorer}/tx/${record.transactionHash}`}
              external
              externalAnnouncement="Opens in a new tab"
              treatment="standalone"
            >
              {record.transactionHash.slice(0, 6)}…
              {record.transactionHash.slice(-4)}
            </Link>
          </Fact>
        </dl>
      </PopoverContent>
    </Popover>
  )
}

export function FillerControl({
  state,
  dispatch,
}: {
  state: WorkspaceState
  dispatch: Dispatch<WorkspaceEvent>
}) {
  return (
    <div data-testid="current-filler" className="space-y-3">
      <InlineMessage
        tone={state.filler === 'error' ? 'danger' : 'warning'}
        density="compact"
        role="status"
      >
        <InlineMessageTitle>CowSwap Auction Filler</InlineMessageTitle>
        <InlineMessageDescription>
          Lab:{' '}
          {state.filler === 'running'
            ? 'running in this browser. Keep this tab open.'
            : state.filler === 'error'
              ? 'the filler stopped after an error. Retry without leaving the auction.'
              : 'stopped. The auction can continue without this browser filler.'}
        </InlineMessageDescription>
      </InlineMessage>
      <p role="status" className={cn(type.supporting, 'text-muted-foreground')}>
        {state.orders} {state.orders === 1 ? 'order' : 'orders'} submitted
      </p>
      <Button
        tone="secondary"
        className="w-full"
        data-testid="current-filler-action"
        onClick={() =>
          dispatch({
            type: 'filler',
            value: state.filler === 'running' ? 'stopped' : 'running',
          })
        }
      >
        {state.filler === 'running'
          ? 'Stop'
          : state.filler === 'error'
            ? 'Retry'
            : 'Start'}
      </Button>
    </div>
  )
}
