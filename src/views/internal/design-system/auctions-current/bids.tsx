import { Button } from '@/components/button'
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
  const chosen = selected === null ? null : bids[selected - 1]
  return (
    <div className="min-w-0 space-y-3">
      <h5 className={type.label}>Bids</h5>
      {hasBids ? (
        <div className="space-y-1">
          {bids.map((bid) => (
            <Button
              key={bid.number}
              tone="quiet"
              data-testid={`current-bid-${bid.number}`}
              aria-expanded={selected === bid.number}
              aria-controls={`${record.symbol}-bid-detail`}
              onClick={() =>
                onSelect(selected === bid.number ? null : bid.number)
              }
              className="w-full justify-between gap-2 px-2 text-left"
            >
              <span>Bid #{bid.number}</span>
              <span className="min-w-0 whitespace-normal text-right font-light">
                {bid.sold}
              </span>
            </Button>
          ))}
        </div>
      ) : (
        <p className={cn(type.supporting, 'text-muted-foreground')}>0</p>
      )}
      {hasBids && chosen && (
        <div
          id={`${record.symbol}-bid-detail`}
          data-testid="current-bid-detail"
          className="min-w-0 space-y-4 pt-1"
        >
          <div className="space-y-3">
            {(['Selling', 'Buying'] as const).map((side, i) => {
              const symbol = i ? chosen.buy : chosen.sell
              const token = record.tokens.find(
                (token) => token.symbol === symbol
              )!
              return (
                <div className="space-y-1" key={side}>
                  <p className={cn(type.supporting, 'text-muted-foreground')}>
                    {side}
                  </p>
                  <Link
                    href={`${explorer}/token/${token.address}`}
                    treatment="contextual"
                    external
                    externalAnnouncement="Opens in a new tab"
                  >
                    {i ? chosen.bought : chosen.sold}
                  </Link>
                  <p className={cn(type.supporting, 'text-muted-foreground')}>
                    {i ? chosen.boughtUsd : chosen.usd}
                  </p>
                </div>
              )
            })}
          </div>
          <dl className="space-y-2">
            <Fact label="Bidder">
              <Link
                href={`${explorer}/address/0x${'b'.repeat(39)}${selected}`}
                external
                externalAnnouncement="Opens in a new tab"
                treatment="standalone"
              >
                0xbbbb…bbb{selected}
              </Link>
            </Fact>
            <Fact label="Transaction">
              <Link
                href={`${explorer}/tx/0x${'c'.repeat(63)}${selected}`}
                external
                externalAnnouncement="Opens in a new tab"
                treatment="standalone"
              >
                0xcccc…ccc{selected}
              </Link>
            </Fact>
          </dl>
        </div>
      )}
    </div>
  )
}
