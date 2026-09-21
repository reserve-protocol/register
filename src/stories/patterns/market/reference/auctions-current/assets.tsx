import { useLayoutEffect, useRef, useState } from 'react'
import { SEPARATOR_WIDTH } from '@/components/entity-identity/logo-stack-frames'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import {
  MarketTokenLogo as TokenLogo,
  MarketTokenLogoStack as TokenLogoStack,
} from '../market-identity'
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
    <div
      className={cn(
        'grid min-w-0 grid-cols-1 gap-5',
        removal
          ? '[@container(min-width:52rem)]:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]'
          : '[@container(min-width:52rem)]:grid-cols-2'
      )}
      data-testid="current-assets"
    >
      {groups.map((tokens, group) => (
        <div key={group} className="min-w-0 space-y-2">
          <p className={cn(type.supporting, 'text-muted-foreground')}>
            {group === 0 ? 'Selling' : 'Buying'}
          </p>
          {data === 'metadata-error' ? (
            <p className={type.body}>—</p>
          ) : (
            <AssetStackSummary tokens={tokens} chainId={record.chainId} />
          )}
        </div>
      ))}
    </div>
  )
}

export function AssetStackSummary({
  tokens,
  chainId,
}: {
  tokens: Asset[]
  chainId: number
}) {
  const container = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const element = container.current
    if (!element) return
    setWidth(element.clientWidth)
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const artworkSize = 32
  const frameSize = artworkSize + SEPARATOR_WIDTH * 2
  const availableStep = Math.max(
    0,
    Math.floor((width - frameSize) / Math.max(1, tokens.length - 1))
  )
  const overlap = Math.max(3, frameSize - artworkSize / 2 - availableStep)
  return (
    <div ref={container} className="flex min-w-0 flex-col gap-2">
      <TokenLogoStack
        aria-hidden="true"
        className="self-start"
        size={artworkSize}
        overlap={overlap}
        tokens={tokens.map(({ symbol, address }) => ({
          symbol,
          address,
          chain: chainId,
        }))}
      />
      <p
        data-testid="current-asset-symbols"
        className={cn(type.supporting, 'break-words text-muted-foreground')}
      >
        {tokens.map((token) => token.symbol).join(', ')}
      </p>
    </div>
  )
}

export function assetGroups(record: SourceRecord, removal = false) {
  const assets = orderedAssets(record)
  const midpoint = removal ? 1 : Math.floor(assets.length / 2)
  return [assets.slice(0, midpoint), assets.slice(midpoint)]
}
