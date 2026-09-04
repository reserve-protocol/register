import { useState } from 'react'

import { Button } from '@/components/button'
import { candidateSemanticRoles as semanticRoles } from '@/components/design-system-v1/semantic-roles'
import { TransactionRequirementRow } from '@/components/design-system-v1/transaction-requirement-row'
import { v1Typography } from '@/components/design-system-v1/typography'
import { Checkbox } from '@/components/ui/checkbox'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import {
  manualBasketValueForAmount,
  manualAssetsForAmount,
  type ManualAssetFixture,
  type ManualIssuanceOperation,
} from './transaction-composition-manual-fixtures'
import { TransactionAssetIdentity } from './transaction-system-assets'

export const ManualIssuanceLedger = ({
  amount,
  operation,
}: {
  amount: string
  operation: ManualIssuanceOperation
}) => {
  const [isUnlimited, setIsUnlimited] = useState(true)
  const assets = manualAssetsForAmount(amount)
  const basketValue = manualBasketValueForAmount(amount)
  const isMint = operation === 'mint'

  return (
    <section
      data-testid="manual-issuance-ledger"
      className={cn(
        'flex min-h-full min-w-0 flex-col',
        semanticRoles.surface.recessedContent
      )}
      aria-labelledby="manual-issuance-ledger-title"
    >
      <header className="flex min-h-24 flex-wrap items-end justify-between gap-4 p-4 sm:p-6">
        <div>
          <h5
            id="manual-issuance-ledger-title"
            className={v1Typography.itemTitle}
          >
            {isMint ? 'Required Approvals' : 'You will receive'}
          </h5>
          <p className={cn(v1Typography.supporting, roles.text.supporting)}>
            {isMint
              ? '2 approvals and 1 revoke required'
              : `${basketValue ?? '—'} estimated basket value`}
          </p>
        </div>
        {isMint && (
          <label className="flex h-8 cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium">
            <span>Unlimited</span>
            <Checkbox
              aria-label="Unlimited approval"
              checked={isUnlimited}
              onCheckedChange={(checked) => setIsUnlimited(checked === true)}
            />
          </label>
        )}
      </header>

      <div
        data-testid="transaction-requirements-list"
        className="mx-2 mb-2 border-y border-border"
      >
        {(assets ?? EMPTY_MANUAL_ASSETS).map((asset) => (
          <ManualAssetRow
            key={asset.symbol}
            asset={asset}
            isPending={!assets}
            operation={operation}
          />
        ))}
      </div>
    </section>
  )
}

const ManualAssetRow = ({
  asset,
  isPending,
  operation,
}: {
  asset: ManualAssetFixture
  isPending: boolean
  operation: ManualIssuanceOperation
}) => {
  const identity = (
    <TransactionAssetIdentity
      chain={ChainId.Base}
      symbol={asset.symbol}
      name={asset.symbol}
      supporting={asset.name}
    />
  )

  if (isPending) {
    return (
      <TransactionRequirementRow
        identity={identity}
        required="—"
        requiredLabel={operation === 'mint' ? 'Required' : 'Expected'}
        balance="—"
        balanceLabel={operation === 'mint' ? 'Balance' : 'Value'}
      />
    )
  }

  if (operation === 'redeem') {
    return (
      <TransactionRequirementRow
        identity={identity}
        required={asset.required}
        requiredLabel="Expected"
        balance={asset.value}
        balanceLabel="Value"
      />
    )
  }

  if (asset.permission === 'approved') {
    return (
      <TransactionRequirementRow
        identity={identity}
        required={asset.required}
        balance={asset.balance}
        status="Approved"
        statusRole="success"
      />
    )
  }

  return (
    <TransactionRequirementRow
      identity={identity}
      required={asset.required}
      balance={asset.balance}
      action={
        <Button size="micro" tone="secondary">
          {asset.permission === 'revoke' ? 'Revoke' : 'Approve'}
        </Button>
      }
    />
  )
}

const EMPTY_MANUAL_ASSETS: ManualAssetFixture[] = [
  'WBTC',
  'WETH',
  'WBNB',
  'AAVE',
  'RSR',
].map((symbol) => ({
  balance: '—',
  name: symbol,
  permission: 'approved',
  required: '—',
  symbol,
  value: '—',
}))
