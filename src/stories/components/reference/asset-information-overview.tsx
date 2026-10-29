import { useId } from 'react'
import type { AssetInformationExample } from './asset-information-fixtures'
import {
  MarketChainBadgedLogo,
  MarketTokenLogo,
} from '../../patterns/market/reference/market-identity'
import { InlineAction } from '@/components/button'
import { CopyableValue } from '@/components/design-system-v1/copyable-value'
import { Link } from '@/components/design-system-v1/link'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { EntityIdentity } from '@/components/entity-identity'
import { v1LayoutRecipes as layout } from '@/components/ui/v1-layout-recipes'
import { cn } from '@/lib/utils'
import { CHAIN_TAGS } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'

export const AssetInformationOverview = ({
  example,
  onRisks,
}: {
  example: AssetInformationExample
  onRisks: () => void
}) => {
  const nativeId = useId()
  const heldId = useId()
  const providerId = useId()
  const { asset, provider } = example

  return (
    <div className={cn(layout.stack.completeGroups, 'py-4')}>
      <section
        aria-labelledby={nativeId}
        className={layout.stack.relatedContent}
      >
        <h3 id={nativeId} className={type.label}>
          Native asset (reference)
        </h3>
        <EntityIdentity
          className="w-full"
          wrapName
          mark={
            <span data-entity-logo-size="xl">
              <MarketTokenLogo size="xl" address={asset.address} alt="" />
            </span>
          }
          name={
            <Link
              href={example.nativeUrl}
              treatment="contextual"
              className={type.itemTitle}
              external
              externalAnnouncement="opens in a new tab"
            >
              {example.nativeName}
            </Link>
          }
          supporting={example.nativeSupporting}
        />
      </section>
      <section aria-labelledby={heldId} className={layout.stack.relatedContent}>
        <h3 id={heldId} className={type.label}>
          {example.heldLabel}
        </h3>
        <EntityIdentity
          className="w-full"
          wrapName
          mark={
            <MarketChainBadgedLogo
              size="xl"
              chain={example.chain}
              address={asset.address}
              symbol={asset.symbol}
            />
          }
          name={
            <Link
              href={getExplorerLink(
                asset.address,
                example.chain,
                ExplorerDataType.TOKEN
              )}
              treatment="contextual"
              className={type.itemTitle}
              external
              externalAnnouncement="opens in a new tab"
            >
              {asset.name} ({asset.symbol})
            </Link>
          }
          supporting={
            <span className="inline-flex max-w-full flex-wrap items-center gap-x-1.5">
              <span>{CHAIN_TAGS[example.chain]}</span>
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap">
                <span aria-hidden="true" data-slot="metadata-separator">
                  ·
                </span>
                <CopyableValue
                  value={asset.address}
                  treatment="inline"
                  tone="neutral"
                />
              </span>
            </span>
          }
        />
      </section>
      <section
        aria-labelledby={providerId}
        className={layout.stack.relatedContent}
      >
        <h3 id={providerId} className={type.label}>
          {provider.name}
        </h3>
        <div className={layout.stack.internalRegions}>
          <p className={cn(type.supporting, 'text-muted-foreground')}>
            {provider.description}
          </p>
          <div
            className={cn(
              'flex flex-wrap items-center',
              layout.cluster.internalRegions
            )}
          >
            <Link
              href={provider.url}
              treatment="standalone"
              external
              externalAnnouncement="opens in a new tab"
            >
              Read docs
            </Link>
            <InlineAction treatment="utility" onClick={onRisks}>
              Read about risks
            </InlineAction>
          </div>
        </div>
      </section>
    </div>
  )
}
