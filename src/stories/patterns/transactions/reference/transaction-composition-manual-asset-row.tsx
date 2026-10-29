import { EntityIdentity } from '@/components/entity-identity'
import { Link } from '@/components/design-system-v1/link'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import { shortenAddress } from '@/utils'
import { ChainId } from '@/utils/chains'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'

import type {
  ManualAssetFixture,
  ManualIssuanceOperation,
} from './transaction-composition-manual-fixtures'
import { TransactionAssetLogo } from './transaction-system-assets'
import { ManualPermission } from './transaction-composition-manual-permission'
import type { ManualApproval } from './transaction-composition-manual-lifecycle'

export const ManualAssetRow = ({
  asset,
  operation,
  approval,
  disabled = false,
  onAction = () => {},
}: {
  asset: ManualAssetFixture
  operation: ManualIssuanceOperation
  approval?: ManualApproval
  disabled?: boolean
  onAction?: () => void
}) => {
  const isMint = operation === 'mint'
  return (
    <article
      data-testid="transaction-requirement-row"
      data-token-symbol={asset.symbol}
      className="min-w-0 px-4 py-3 [container-type:inline-size]"
    >
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 [@container(max-width:20rem)]:grid-cols-2">
        <EntityIdentity
          className="[&_[data-slot=entity-identity-name]]:whitespace-normal [&_[data-slot=entity-identity-name]]:[overflow-wrap:anywhere]"
          density="default"
          mark={
            <TransactionAssetLogo
              chain={ChainId.Mainnet}
              size="xl"
              symbol={asset.symbol}
            />
          }
          name={<span title={asset.name}>{asset.name}</span>}
          supporting={
            <Link
              treatment="return"
              href={getExplorerLink(
                asset.address,
                ChainId.Mainnet,
                ExplorerDataType.TOKEN
              )}
              external
              externalAnnouncement=", opens in a new tab"
              className="max-w-full"
              title={asset.address}
            >
              <span className="sr-only">{asset.address}</span>
              <span aria-hidden="true" className="truncate">
                <span className="[@container(max-width:20rem)]:hidden">
                  {shortenAddress(asset.address)}
                </span>
                <span className="hidden [@container(max-width:20rem)]:inline">
                  …{asset.address.slice(-4)}
                </span>
              </span>
            </Link>
          }
        />
        {isMint && asset.permission && (
          <div
            data-testid="manual-asset-permission"
            className="flex min-h-7 items-center justify-end"
          >
            <ManualPermission
              asset={asset}
              approval={approval}
              disabled={disabled}
              onAction={onAction}
            />
          </div>
        )}
        {!isMint && (
          <dl className="ml-auto min-w-0 text-right">
            <dt className="sr-only">
              <>Expected</>
            </dt>
            <dd
              className={cn(v1Typography.itemTitle, 'break-words tabular-nums')}
            >
              <ManualAssetAmount value={asset.required} symbol={asset.symbol} />
            </dd>
            <dt className="sr-only">
              <>Value</>
            </dt>
            <dd
              className={cn(
                v1Typography.supporting,
                roles.text.supporting,
                'tabular-nums [overflow-wrap:anywhere]'
              )}
            >
              {asset.value}
            </dd>
          </dl>
        )}
      </div>
      {isMint && (
        <dl className="mt-2 grid grid-cols-2 gap-x-4">
          <div className="contents">
            <dt
              className={cn(
                v1Typography.supporting,
                roles.text.supporting,
                'col-start-1 row-start-1 min-w-0'
              )}
            >
              <>Required</>
            </dt>
            <dd
              className={cn(
                v1Typography.itemTitle,
                'col-start-1 row-start-2 min-w-0 break-words tabular-nums'
              )}
            >
              <ManualAssetAmount value={asset.required} symbol={asset.symbol} />
            </dd>
          </div>
          <div className="contents">
            <dt
              aria-label={
                asset.isInsufficient ? `Insufficient balance` : undefined
              }
              className={cn(
                v1Typography.supporting,
                'col-start-2 row-start-1 min-w-0 justify-self-end text-right',
                asset.isInsufficient
                  ? 'text-destructive'
                  : roles.text.supporting
              )}
            >
              {asset.isInsufficient ? (
                <>
                  <span className="[@container(max-width:20rem)]:hidden">
                    <>Insufficient balance</>
                  </span>
                  <span className="hidden [@container(max-width:20rem)]:inline">
                    <>Insufficient</>
                  </span>
                </>
              ) : (
                <>Balance</>
              )}
            </dt>
            <dd
              className={cn(
                v1Typography.body,
                'col-start-2 row-start-2 min-w-0 break-words text-right tabular-nums'
              )}
            >
              <ManualAssetAmount value={asset.balance} symbol={asset.symbol} />
            </dd>
          </div>
        </dl>
      )}
    </article>
  )
}

const ManualAssetAmount = ({
  value,
  symbol,
}: {
  value: string
  symbol: string
}) => {
  const amount = value.endsWith(` ${symbol}`)
    ? value.slice(0, -(symbol.length + 1))
    : value
  return (
    <>
      <span className="[overflow-wrap:anywhere]">{amount}</span>{' '}
      <span className="whitespace-nowrap [@container(max-width:17rem)]:block">
        {symbol}
      </span>
    </>
  )
}
