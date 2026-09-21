import { useState, type RefObject } from 'react'
import { Button } from '@/components/button'
import { Link } from '@/components/design-system-v1/link'
import {
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/design-system-v1/collapsible'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import {
  EntityIdentity,
  MarketTokenLogo as TokenLogo,
} from '../market-identity'
import { CurrentValue, Fact } from './facts'
import { assetGroups } from './assets'
import { LiquidityDetail } from './liquidity-detail'
import { tradeCents, usdFromCents } from './weights-model'
import type { DataState, SourceRecord } from './fixtures'

export function AuctionLiquidityTrigger({
  record,
  triggerRef,
}: {
  record: SourceRecord
  triggerRef?: RefObject<HTMLButtonElement>
}) {
  return (
    <CollapsibleTrigger
      data-testid="current-liquidity-toggle"
      ref={triggerRef}
      className={cn(
        type.label,
        '-ml-4 w-fit max-w-full self-start justify-start gap-2'
      )}
    >
      <span className="inline-flex flex-wrap items-center gap-x-2">
        Assets and liquidity
        <span
          data-testid="current-liquidity-count"
          className={cn(type.supporting, 'text-muted-foreground')}
        >
          {record.tokens.length} tokens
        </span>
      </span>
    </CollapsibleTrigger>
  )
}

export function AuctionLiquidity({
  record,
  data,
  warnings,
  marketClosed,
  removal,
  live,
  onClose,
}: {
  record: SourceRecord
  data: DataState
  warnings: boolean
  marketClosed: boolean
  removal: boolean
  live: boolean
  onClose: () => void
}) {
  const [retried, setRetried] = useState(false)
  const groups = assetGroups(record, removal)
  const total = tradeCents(warnings)
  const explorer =
    record.chainId === 56 ? 'https://bscscan.com' : 'https://basescan.org'
  return (
    <CollapsibleContent
      data-testid="current-liquidity"
      className="mt-0 px-0 pb-0"
    >
      <div className="space-y-6 text-foreground">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="min-w-0 space-y-2">
              <dl
                data-testid="current-liquidity-summary"
                className="w-fit max-w-full"
              >
                <Fact label="Estimated trade liquidity" inline>
                  {data !== 'ready' ? 'Unknown' : warnings ? 'Low' : 'High'}
                </Fact>
              </dl>
            </div>
            <Button
              tone="secondary"
              data-testid="current-liquidity-refresh"
              onClick={() => setRetried(true)}
            >
              Refresh
            </Button>
          </div>
          <p className={cn(type.supporting, 'max-w-xl text-muted-foreground')}>
            {live
              ? 'refreshed trade estimates, not original auction terms or executed results.'
              : 'Simulated route. Actual auction path may differ.'}
          </p>
        </div>
        {groups.map((tokens, group) => (
          <section key={group} className="min-w-0 space-y-3">
            <h5 className={type.itemTitle}>{group ? 'Buying' : 'Selling'}</h5>
            <Table
              data-testid="current-liquidity-table"
              aria-label={group ? 'Buying' : 'Selling'}
              className="table-fixed"
            >
              <TableHeader className="hidden [&_tr]:border-0 [@container(min-width:48rem)]:table-header-group">
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="h-auto w-[32%] pb-2 pl-0 pr-4 text-muted-foreground">
                    Asset
                  </TableHead>
                  <TableHead className="h-auto w-[24%] px-3 pb-2 text-right text-muted-foreground">
                    Estimated trade value
                  </TableHead>
                  <TableHead className="h-auto w-[20%] px-3 pb-2 text-right text-muted-foreground">
                    Estimated price impact
                  </TableHead>
                  <TableHead className="h-auto w-[24%] pb-2 pl-3 pr-0 text-right text-muted-foreground">
                    Liquidity / market status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token, index) => {
                  const amount =
                    total / BigInt(tokens.length) +
                    (index === 0 ? total % BigInt(tokens.length) : 0n)
                  const unknown =
                    data !== 'ready' ||
                    (warnings &&
                      ((token.symbol === 'ETH' && !retried) ||
                        token.symbol === 'NVDAon'))
                  const low = warnings && token.symbol === 'XRP'
                  return (
                    <TableRow
                      key={token.address}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-0 py-3 hover:bg-transparent [@container(min-width:48rem)]:table-row"
                    >
                      <TableCell className="min-w-0 p-0 [@container(min-width:48rem)]:py-3 [@container(min-width:48rem)]:pr-4">
                        <EntityIdentity
                          className="w-full"
                          mark={
                            <TokenLogo
                              address={token.address}
                              symbol={token.symbol}
                              chain={record.chainId}
                              size="xl"
                            />
                          }
                          name={
                            <Link
                              href={`${explorer}/token/${token.address}`}
                              treatment="contextual"
                              external
                              externalAnnouncement="Opens in a new tab"
                            >
                              {token.symbol}
                            </Link>
                          }
                          supporting={token.name}
                        />
                      </TableCell>
                      <TableCell
                        className={cn(
                          type.body,
                          'p-0 text-right [@container(min-width:48rem)]:px-3 [@container(min-width:48rem)]:py-3'
                        )}
                      >
                        <span className="sr-only [@container(min-width:48rem)]:hidden">
                          Estimated trade value{' '}
                        </span>
                        <CurrentValue data={data}>
                          {usdFromCents(amount)}
                        </CurrentValue>
                      </TableCell>
                      <TableCell className="p-0 [@container(min-width:48rem)]:px-3 [@container(min-width:48rem)]:py-3 [@container(min-width:48rem)]:text-right">
                        <span
                          className={cn(
                            type.supporting,
                            'inline-flex flex-wrap items-center gap-x-2',
                            low && 'text-destructive'
                          )}
                        >
                          <span className="text-muted-foreground [@container(min-width:48rem)]:hidden">
                            Est. impact
                          </span>
                          <span className="tabular-nums">
                            {unknown ? '—' : low ? '8.4%' : '0.3%'}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="p-0 text-right [@container(min-width:48rem)]:py-3 [@container(min-width:48rem)]:pl-3">
                        <LiquidityDetail
                          token={token}
                          chainId={record.chainId}
                          data={data}
                          warnings={warnings}
                          marketClosed={marketClosed}
                          amount={amount}
                          retried={retried}
                          onRetry={() => setRetried(true)}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </section>
        ))}
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 [@container(min-width:48rem)]:grid-cols-2">
          <Fact label="Total trade value">
            <CurrentValue data={data}>{usdFromCents(total)}</CurrentValue>
          </Fact>
          <Fact label="Estimated total impact">
            <CurrentValue data={data}>
              {warnings ? '−8.4%' : '−0.3%'}
            </CurrentValue>
          </Fact>
        </dl>
        {retried && (
          <p
            role="status"
            className={cn(type.supporting, 'text-muted-foreground')}
          >
            liquidity response refreshed.
          </p>
        )}
        <CollapsibleTrigger
          data-testid="current-liquidity-close"
          className={cn(
            type.label,
            '-ml-4 w-fit max-w-full justify-start gap-2'
          )}
          onClick={onClose}
        >
          Assets and liquidity
        </CollapsibleTrigger>
      </div>
    </CollapsibleContent>
  )
}
