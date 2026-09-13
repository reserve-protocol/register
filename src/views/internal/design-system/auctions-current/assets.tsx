import TokenLogo from '@/components/token-logo'
import { TokenLogoStack } from '@/components/entity-identity/token-logo-stack'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import {
  type Asset,
  type DataState,
  type SourceRecord,
  orderedAssets,
} from './fixtures'

export function AssetName({
  token,
  chainId,
  full = false,
}: {
  token: Asset
  chainId: number
  full?: boolean
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <TokenLogo
        address={token.address}
        symbol={token.symbol}
        chain={chainId}
        size="lg"
      />
      <span className={cn(type.body, 'min-w-0 break-words')}>
        {full ? token.name : token.symbol}
      </span>
    </div>
  )
}

export function AuctionAssets({
  record,
  data,
  removal = false,
}: {
  record: SourceRecord
  data: DataState
  removal?: boolean
}) {
  const groups = assetGroups(record, removal)
  return (
    <div className="min-w-0 space-y-5" data-testid="current-assets">
      {groups.map((tokens, group) => (
        <div key={group} className="min-w-0 space-y-2">
          <p className={cn(type.supporting, 'text-muted-foreground')}>
            {group === 0 ? 'Selling' : 'Buying'}
          </p>
          <div className="flex min-h-8 min-w-0 items-center gap-3">
            <TokenLogoStack
              size={32}
              overlap={3}
              tokens={tokens
                .slice(0, 2)
                .map((token) => ({ ...token, chain: record.chainId }))}
            />
            <span className={cn(type.itemTitle, 'min-w-0 break-words')}>
              {data === 'metadata-error'
                ? '—'
                : tokens
                    .slice(0, 2)
                    .map((token) => token.symbol)
                    .join(', ')}
              {tokens.length > 2 && (
                <span
                  className={cn(
                    type.body,
                    'ml-1 whitespace-nowrap text-muted-foreground'
                  )}
                >
                  +{tokens.length - 2}
                </span>
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function assetGroups(record: SourceRecord, removal = false) {
  const assets = orderedAssets(record)
  const midpoint = removal ? 1 : Math.floor(assets.length / 2)
  return [assets.slice(0, midpoint), assets.slice(midpoint)]
}
