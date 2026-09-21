import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/design-system-v1/collapsible'
import { Link } from '@/components/design-system-v1/link'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import type { SourceRecord } from './fixtures'
import { Fact } from './facts'

export function AuctionBids({
  record,
  hasBids,
  selected,
  onSelect,
}: {
  record: SourceRecord
  hasBids: boolean
  selected: number | null
  onSelect: (value: number | null) => void
}) {
  const explorer =
    record.chainId === 56 ? 'https://bscscan.com' : 'https://basescan.org'
  const tokens =
    record.chainId === 56
      ? ['ETH', 'BTCB', 'XRP', 'WBNB']
      : ['WETH', 'cbBTC', 'uXRP', 'uSOL']
  const bids = [
    {
      number: 1,
      sold: `500 ${tokens[0]}`,
      bought: `11 ${tokens[1]}`,
      usd: '$1,236,666.64',
      boughtUsd: '$1,220,000',
      sell: tokens[0],
      buy: tokens[1],
    },
    {
      number: 2,
      sold: `250 ${tokens[2]}`,
      bought: `2 ${tokens[3]}`,
      usd: '$1,266.68',
      boughtUsd: '$1,250',
      sell: tokens[2],
      buy: tokens[3],
    },
  ]
  return (
    <div className="min-w-0 space-y-3">
      <h5 data-testid="current-bids-heading" className={type.label}>
        Bids{' '}
        <span className={cn(type.supporting, 'text-muted-foreground')}>
          · {hasBids ? bids.length : 0}
        </span>
      </h5>
      {hasBids ? (
        <div className="-ml-4">
          {bids.map((bid) => (
            <Collapsible
              key={bid.number}
              open={selected === bid.number}
              onOpenChange={(open) => onSelect(open ? bid.number : null)}
            >
              <CollapsibleTrigger
                data-testid={`current-bid-${bid.number}`}
                className={cn(selected === bid.number && 'text-primary')}
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span
                    className={cn(
                      type.body,
                      'flex flex-wrap items-center gap-x-2'
                    )}
                  >
                    <span>{bid.sold}</span>
                    <span aria-hidden="true" className="text-muted-foreground">
                      →
                    </span>
                    <span className="sr-only">Buying </span>
                    <span>{bid.bought}</span>
                  </span>
                  <span
                    className={cn(
                      type.supporting,
                      selected !== bid.number && 'text-muted-foreground'
                    )}
                  >
                    Bid #{bid.number}
                  </span>
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {selected === bid.number && (
                  <div
                    data-testid="current-bid-detail"
                    className="min-w-0 space-y-4 pt-1 text-foreground"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {(['Selling', 'Buying'] as const).map((side, i) => {
                        const symbol = i ? bid.buy : bid.sell
                        const token = record.tokens.find(
                          (token) => token.symbol === symbol
                        )!
                        return (
                          <div className="min-w-0 space-y-1" key={side}>
                            <p
                              className={cn(
                                type.supporting,
                                'text-muted-foreground'
                              )}
                            >
                              {side}
                            </p>
                            <Link
                              href={`${explorer}/token/${token.address}`}
                              treatment="contextual"
                              external
                              externalAnnouncement="Opens in a new tab"
                            >
                              {i ? bid.bought : bid.sold}
                            </Link>
                            <p
                              className={cn(
                                type.supporting,
                                'break-words text-muted-foreground'
                              )}
                            >
                              {i ? bid.boughtUsd : bid.usd}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                    <dl className="space-y-2">
                      <Fact label="Bidder">
                        <Link
                          href={`${explorer}/address/0x${'b'.repeat(39)}${bid.number}`}
                          external
                          externalAnnouncement="Opens in a new tab"
                          treatment="standalone"
                        >
                          0xbbbb…bbb{bid.number}
                        </Link>
                      </Fact>
                      <Fact label="Transaction">
                        <Link
                          href={`${explorer}/tx/0x${'c'.repeat(63)}${bid.number}`}
                          external
                          externalAnnouncement="Opens in a new tab"
                          treatment="standalone"
                        >
                          0xcccc…ccc{bid.number}
                        </Link>
                      </Fact>
                    </dl>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      ) : (
        <p
          data-testid="current-empty-bids"
          className={cn(type.supporting, 'text-muted-foreground')}
        >
          Bidding is ongoing...
        </p>
      )}
    </div>
  )
}
