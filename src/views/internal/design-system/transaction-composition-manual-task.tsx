import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { TransactionAmountObject } from '@/components/design-system-v1/transaction-amount-object'
import { v1Typography } from '@/components/design-system-v1/typography'
import { Button, InlineAction } from '@/components/button'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import {
  isManualAmountPositive,
  manualShareValueForAmount,
  type ManualIssuanceAnchorState,
  type ManualIssuanceOperation,
} from './transaction-composition-manual-fixtures'
import { TransactionAmountAsset } from './transaction-system-assets'

export const ManualIssuanceTask = ({
  amount,
  onAmountChange,
  onStateChange,
  operation,
}: {
  amount: string
  onAmountChange: (amount: string) => void
  onStateChange: (state: ManualIssuanceAnchorState) => void
  operation: ManualIssuanceOperation
}) => {
  const isMint = operation === 'mint'
  const shareValue = manualShareValueForAmount(amount)

  return (
    <section
      data-testid="manual-issuance-task"
      className="flex min-h-full min-w-0 flex-col bg-card p-4 sm:p-6"
      aria-labelledby="manual-issuance-task-title"
    >
      <SegmentedControl
        aria-label="Manual issuance mode"
        presentation="contained"
        size="compact"
        width="intrinsic"
        value={operation}
        onValueChange={(value) =>
          onStateChange(
            value === 'redeem' ? 'Redeem preview' : 'Mint requirements'
          )
        }
      >
        <SegmentedControlItem value="mint">Mint</SegmentedControlItem>
        <SegmentedControlItem value="redeem">Redeem</SegmentedControlItem>
      </SegmentedControl>

      <header className="mt-6">
        <h4
          id="manual-issuance-task-title"
          className="text-2xl font-light leading-8"
        >
          {isMint ? 'Mint CMC20 manually' : 'Redeem CMC20 manually'}
        </h4>
        <p
          className={cn(
            'mt-1 max-w-md',
            v1Typography.body,
            roles.text.supporting
          )}
        >
          {isMint
            ? 'Choose the DTF share amount, approve the required basket assets, then mint.'
            : 'Choose the DTF share amount and review the basket assets you will receive.'}
        </p>
      </header>

      <TransactionAmountObject
        className="mt-6"
        label={isMint ? 'Shares to mint' : 'Shares to redeem'}
        amount={amount}
        amountPlaceholder="0"
        onAmountChange={onAmountChange}
        presentation="input"
        asset={<TransactionAmountAsset chain={ChainId.Base} symbol="CMC20" />}
        supporting={shareValue ?? '$0.00'}
        balance="Max 124.63 CMC20"
        balanceAction={
          <InlineAction onClick={() => onAmountChange('124.63')}>
            Use
          </InlineAction>
        }
      />

      <Button
        className="mt-4 w-full"
        disabled={!isManualAmountPositive(amount)}
      >
        {isMint ? 'Approve All (2)' : `Redeem ${amount || '0'} CMC20`}
      </Button>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
        <p className={cn(v1Typography.supporting, roles.text.supporting)}>
          {isMint ? 'Having issues minting?' : 'Having issues redeeming?'}
        </p>
        <Button size="compact" tone="secondary">
          {isMint ? 'Switch to zap minting' : 'Switch to zap redeeming'}
        </Button>
      </div>
    </section>
  )
}
