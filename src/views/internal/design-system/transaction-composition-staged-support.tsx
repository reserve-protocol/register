import { TransactionIdentity } from '@/components/design-system-v1/transaction-identity'
import { v1Typography } from '@/components/design-system-v1/typography'
import ChainLogo from '@/components/icons/ChainLogo'
import {
  LifecycleStatusPill,
  type LifecycleStatusRole,
} from '@/components/lifecycle-status'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import { TransactionAssetIdentity } from './transaction-system-assets'

export const StagedOrderRow = ({
  amount,
  asset,
  detail,
  role,
  status,
}: {
  amount: string
  asset: string
  detail: string
  role: LifecycleStatusRole
  status: string
}) => (
  <div
    data-testid="staged-order-row"
    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-4"
  >
    <div className="min-w-0">
      <TransactionAssetIdentity
        chain={ChainId.Base}
        symbol={asset}
        name={`Acquire ${asset}`}
        supporting={amount}
      />
    </div>
    <span className="col-start-2 row-start-1 justify-self-end">
      <LifecycleStatusPill role={role}>{status}</LifecycleStatusPill>
    </span>
    <p
      className={cn(
        'col-span-2',
        v1Typography.supporting,
        roles.text.supporting
      )}
    >
      {detail}
    </p>
  </div>
)

export const AutomatedMintIdentity = () => (
  <TransactionIdentity
    label="Final mint transaction"
    value="0x4b9956225163659ad723853515456526280c1e9cc5b842c3df1b9c7443bb01ae"
    visibleValue="0x4B99…01AE"
    network="Base"
    networkMark={
      <ChainLogo aria-hidden="true" chain={ChainId.Base} className="size-4" />
    }
    explorerLabel="Transaction"
    explorerHref="https://basescan.org"
    externalAnnouncement="Opens Basescan in a new tab"
  />
)
